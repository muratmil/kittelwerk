import { PRODUCTS as META } from '@/data/products';
import { effectivePrice, haendlerPrice } from '@/lib/pricing';

// Ürünün iki yarısı:
//   yapısı  → data/products.js  (fotoğraf, renk, açıklama, ölçü tablosu, baskı mantığı)
//   fiyatı  → veritabanı        (alış, satış, kademeler, mod, marj)
// Burada birleştiriliyor. "Hiçbir fiyat kodda olmayacak" kuralı bu ayrımla tutuluyor.

const metaById = Object.fromEntries(META.map((p) => [p.id, p]));

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

/**
 * Katalog: veritabanı fiyatları + koddaki ürün yapısı.
 * `haendler` verilirse fiyatlar o bayinin koşullarına göre döner.
 */
export async function loadCatalog(client, { haendler = null, includeInactive = false, siteId = 'kittelwerk' } = {}) {
  const [{ data: rows }, { data: prices }, ctx] = await Promise.all([
    client.from('products').select('*').eq('site_id', siteId).order('sort_order'),
    client.from('product_prices').select('*').eq('site_id', siteId),
    loadPricingContext(client, siteId),
  ]);

  const tiersByProduct = {};
  for (const p of prices ?? []) (tiersByProduct[p.product_id] ??= []).push(p);

  const products = (rows ?? [])
    .filter((p) => includeInactive || p.active)
    .map((p) => {
      const meta = metaById[p.id] ?? {};
      const tiers = (tiersByProduct[p.id] ?? []).sort((a, b) => a.min_qty - b.min_qty);
      const rate = ctx.rateByCurrency[p.cost_currency] ?? null;

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
