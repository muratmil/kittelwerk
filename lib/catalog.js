import { effectivePrice, haendlerPrice } from '@/lib/pricing';

// Ürünün her iki yarısı da artık VERİTABANINDA:
//   yapısı  → products.meta  (fotoğraf, renk, açıklama, ölçü tablosu, baskı mantığı)
//   fiyatı  → products + product_prices  (alış, satış, kademeler, mod, marj)
//
// Eskiden yapı `data/products.js`'ten okunuyordu; bu, portalın sipariş
// ekranlarını dükkânın repo'suna bağlıyordu. Portal (CCH) kendi projesine
// çıkacağı için bağ koparıldı — iki uygulama da aynı yerden okuyor, ortak
// kod kalmadı. `data/products.js` hâlâ kaynak metin ama çalışma anında
// okunmuyor; oraya yazdıktan sonra `node scripts/push-products-meta.mjs`.

/** Fiyatlandırma bağlamı: kur, yuvarlama ayarı, marj varsayılanları. */
export async function loadPricingContext(client, siteId = 'kittelwerk') {
  const [{ data: settings }, { data: marginDefaults }, { data: rates }] = await Promise.all([
    client.from('pricing_settings').select('*').eq('site_id', siteId).maybeSingle(),
    client.from('margin_defaults').select('*').eq('site_id', siteId),
    client.from('exchange_rates').select('currency, rate, valid_from').order('valid_from', { ascending: false }),
  ]);

  // Her para birimi için en güncel kur
  const rateByCurrency = {};
  for (const r of rates ?? []) {
    if (rateByCurrency[r.currency] == null) rateByCurrency[r.currency] = Number(r.rate);
  }

  return { settings: settings ?? {}, marginDefaults: marginDefaults ?? [], rateByCurrency };
}

// `products` ve `product_prices` VİTRİNE açık tablolar — anon anahtarıyla
// okunuyorlar. Ama içlerindeki her sütun açık DEĞİL: `cost_price`,
// `cost_currency`, `margin_override` ve `product_prices.margin` Murat'ın alış
// fiyatı ve marjı. Bu sütunların SELECT yetkisi veritabanında anon ve
// authenticated'tan alındı, yani `select('*')` artık 401 döner. Sütunlar bu
// yüzden tek tek yazılı — buraya yeni bir sütun eklerken önce onun herkese
// açık olup olmadığına karar ver.
const URUN_SUTUNLARI =
  'id, name, category, active, coming_soon, sort_order, price_mode, min_qty, updated_at, site_id, meta, mwst';
const MALIYET_SUTUNLARI = 'cost_price, cost_currency, margin_override';
const KADEME_SUTUNLARI = 'product_id, min_qty, price, site_id';

/**
 * Katalog: veritabanı fiyatları + koddaki ürün yapısı.
 * `haendler` verilirse fiyatlar o bayinin koşullarına göre döner.
 *
 * `mitKosten` YALNIZCA service key ile çağrılabilir. Oturum ya da anon
 * istemcisiyle verilirse sorgu 401 ile döner — sessizce boş gelmez, bu
 * bilerek: yanlış istemciyle maliyet istemek görünür bir hata olmalı.
 */
export async function loadCatalog(client, { haendler = null, includeInactive = false, siteId = 'kittelwerk', mitKosten = false } = {}) {
  const urunAlanlari = mitKosten ? `${URUN_SUTUNLARI}, ${MALIYET_SUTUNLARI}` : URUN_SUTUNLARI;
  const kademeAlanlari = mitKosten ? `${KADEME_SUTUNLARI}, margin` : KADEME_SUTUNLARI;

  const [{ data: rows }, { data: prices }, ctx] = await Promise.all([
    client.from('products').select(urunAlanlari).eq('site_id', siteId).order('sort_order'),
    client.from('product_prices').select(kademeAlanlari).eq('site_id', siteId),
    loadPricingContext(client, siteId),
  ]);

  const tiersByProduct = {};
  for (const p of prices ?? []) (tiersByProduct[p.product_id] ??= []).push(p);

  const products = (rows ?? [])
    .filter((p) => includeInactive || p.active)
    .map((p) => {
      const meta = p.meta ?? {};
      const tiers = (tiersByProduct[p.id] ?? []).sort((a, b) => a.min_qty - b.min_qty);
      const rate = ctx.rateByCurrency[p.cost_currency] ?? null;

      // Maliyetten hesaplanan bir ürün, maliyet OKUNMADAN yüklenirse
      // `effectivePrice` elle girilen kademeye düşer — fiyat yanlış olmaz ama
      // marj motoru sessizce devre dışı kalır. Sessiz kalmasın:
      if (!mitKosten && p.price_mode && p.price_mode !== 'manuell') {
        console.error(`[catalog] "${p.id}" ürünü '${p.price_mode}' modunda ama maliyet `
          + 'sütunları okunmadı; fiyat elle girilen kademeden geliyor. Bu çağrı '
          + 'service key ile ve mitKosten:true yapılmalı.');
      }

      // Her kademe için satış fiyatı — vitrindeki Staffelpreis tablosu bu.
      const staffel = tiers.map((t) => {
        const res = effectivePrice(p, tiers, t.min_qty, { ...ctx, rate });
        const listPrice = res.price;
        return {
          minQty: t.min_qty,
          price: haendler ? haendlerPrice(listPrice, p.id, haendler) : listPrice,
          listPrice,
          source: res.source,
          costEur: res.costEur,
          margin: res.margin,
        };
      });

      return {
        ...meta,
        id: p.id,
        siteId: p.site_id,
        name: p.name ?? meta.name,
        category: p.category ?? meta.category,
        comingSoon: p.coming_soon,
        minQty: p.min_qty,
        priceMode: p.price_mode,
        costPrice: p.cost_price,
        costCurrency: p.cost_currency,
        marginOverride: p.margin_override,
        tiers: staffel.map((s) => ({ minQty: s.minQty, price: s.price })),
        staffel,
        newPrice: staffel[0]?.price ?? null,
        oldPrice: meta.oldPrice ?? null,
      };
    });

  return { products, siteId, ...ctx };
}

/** Tek ürünün belirli adetteki fiyatı — sipariş hesabında kullanılıyor. */
export function priceOf(product, qty, haendler = null) {
  const hit = [...(product.staffel ?? [])].sort((a, b) => a.minQty - b.minQty)
    .filter((s) => qty >= s.minQty).pop() ?? product.staffel?.[0];
  if (!hit) return null;
  return haendler ? haendlerPrice(hit.listPrice, product.id, haendler) : hit.price;
}
