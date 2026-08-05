// Fiyat hesabı — saf fonksiyonlar, veritabanı yok. scripts/pricing-test.mjs test eder.
//
// İki mod:
//   manuell — fiyat elle girilir. Maliyet ve kur yalnızca marjı GÖSTERMEK için.
//   marge   — fiyat = alış × kur × (1 + marj), sonra yuvarlanır.
//
// Kittelwerk'te tüm ürünler manuell. Marj motoru Wipello için hazır duruyor.

/** Adede uyan kademe: min_qty'si adedi geçmeyenlerin en büyüğü. */
export function tierFor(tiers, qty) {
  const sorted = [...(tiers ?? [])].sort((a, b) => a.min_qty - b.min_qty);
  let hit = null;
  for (const t of sorted) if (qty >= t.min_qty) hit = t;
  return hit ?? sorted[0] ?? null;
}

/** Alış fiyatının euro karşılığı. Kur yoksa null — uydurmuyoruz. */
export function costInEur(product, rate) {
  if (product?.cost_price == null) return null;
  if (product.cost_currency === 'EUR') return Number(product.cost_price);
  if (rate == null) return null;
  // Dört haneye yuvarlanıyor: kayan nokta artığını temizler ama Wipello'daki
  // kuruş altı birim maliyetlerin hassasiyetini korur.
  return Math.round(Number(product.cost_price) * Number(rate) * 1e4) / 1e4;
}

export function applyRounding(value, settings) {
  const step = Number(settings?.round_to ?? 1);
  const mode = settings?.round_mode ?? 'up';
  if (!(step > 0)) return value;
  const n = value / step;
  const r = mode === 'up' ? Math.ceil(n) : mode === 'down' ? Math.floor(n) : Math.round(n);
  // Kayan nokta artıklarını temizle (7.1699999 gibi)
  return Math.round(r * step * 1e6) / 1e6;
}

/** Marj devralma: ürün marjı → kategori marjı → genel marj. */
export function marginFor(product, tier, defaults) {
  if (tier?.margin != null) return Number(tier.margin);
  if (product?.margin_override != null) return Number(product.margin_override);
  const byScope = (scope) =>
    (defaults ?? []).find((d) => d.scope === scope && d.min_qty === tier?.min_qty)?.margin;
  const cat = byScope(product?.category);
  if (cat != null) return Number(cat);
  const global = byScope('global');
  return global != null ? Number(global) : null;
}

/**
 * Bir ürünün belirli adetteki satış fiyatı.
 * Dönen: { price, source, tier, costEur, margin }
 *   source: 'manuell' | 'marge' | null (hesaplanamadı)
 *   margin: gerçekleşen marj yüzdesi — maliyet bilinmiyorsa null
 */
export function effectivePrice(product, tiers, qty, ctx = {}) {
  const { rate, settings, marginDefaults } = ctx;
  const tier = tierFor(tiers, qty);
  const costEur = costInEur(product, rate);

  let price = null;
  let source = null;

  if (product?.price_mode === 'marge') {
    const margin = marginFor(product, tier, marginDefaults);
    if (costEur != null && margin != null) {
      price = applyRounding(costEur * (1 + margin / 100), settings);
      source = 'marge';
    }
  }

  // manuell — ve marge hesaplanamadıysa elle girilen fiyata düşüyoruz,
  // vitrinde fiyatsız ürün kalmasın.
  if (price == null && tier?.price != null) {
    price = Number(tier.price);
    source = 'manuell';
  }

  return {
    price,
    source,
    tier,
    costEur,
    margin: realisedMargin(price, costEur),
  };
}

/** Gerçekleşen marj: (satış − maliyet) / satış. Elle fiyatlananın sağlık göstergesi. */
export function realisedMargin(price, costEur) {
  if (price == null || costEur == null || price <= 0) return null;
  return Math.round(((price - costEur) / price) * 1000) / 10;
}

export function isLowMargin(margin, settings) {
  if (margin == null) return false;
  return margin < Number(settings?.low_margin_threshold ?? 35);
}

/** Bayi iskontosu: önce ürüne özel fiyat, yoksa yüzde indirim. */
export function haendlerPrice(basePrice, productId, haendler) {
  if (basePrice == null) return null;
  const custom = haendler?.custom_prices?.[productId];
  if (custom != null) return Number(custom);
  const rate = Number(haendler?.discount_rate ?? 0);
  if (!rate) return basePrice;
  return Math.round(basePrice * (1 - rate / 100) * 100) / 100;
}

/** Kargo — 300 €'dan sonra ücretsiz, mevcut kuralla aynı. */
export function shippingFor(subtotal) {
  if (subtotal >= 300) return 0;
  if (subtotal >= 100) return 14.90;
  return 6.90;
}
