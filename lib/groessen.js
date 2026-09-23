/**
 * Beden ve beden farkı (2026-09-23).
 *
 * Murat: "3XL ve 4XL alabiliyoruz, 1 € fark ile." Tamirhane ve inşaat
 * firmalarında bu bedenler olmadan sipariş komple kaçıyor.
 *
 * Fark ürüne yazılı: `meta.sizeSurcharge = { "3XL": 1, "4XL": 1 }`. Böylece
 * tedarikçi zammı gelince kod dağıtmadan veritabanından değişir. Tanımsızsa
 * fark YOKTUR — eski ürünler etkilenmez.
 *
 * Buradaki fonksiyonlar SAF: hem tarayıcıdaki sepet hem de sunucudaki sipariş
 * ucu aynısını kullanıyor, yoksa müşterinin gördüğü tutar ile faturalanan
 * tutar ayrışır.
 */

export const STANDARD_GROESSEN = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const GROSSE_GROESSEN = ['3XL', '4XL'];

/** Bu bedenin parça başına farkı (€). Tanımsızsa 0. */
export function groessenAufpreis(produkt, groesse) {
  const tabelle = produkt?.sizeSurcharge;
  if (!tabelle || typeof tabelle !== 'object') return 0;
  const wert = Number(tabelle[groesse]);
  return Number.isFinite(wert) && wert > 0 ? wert : 0;
}

/** Üründe farklı fiyatlanan beden var mı? (Bilgi metni için) */
export function hatAufpreis(produkt) {
  return Object.values(produkt?.sizeSurcharge ?? {}).some((v) => Number(v) > 0);
}

/** Yalnız farkların toplamı — "davon Größenaufpreis" satırı için. */
export function aufpreisSumme(zeile) {
  const bedenler = zeile?.sizes ?? {};
  return Object.entries(bedenler).reduce(
    (toplam, [groesse, adet]) => toplam + (Number(adet) || 0) * groessenAufpreis(zeile, groesse),
    0,
  );
}

/**
 * Sepet satırının toplamı: her beden kendi farkıyla çarpılıyor.
 * Bedensiz ürünlerde (`sizes` = { '-': 10 }) fark tablosu boş olduğu için
 * sonuç eski davranışla birebir aynı kalır.
 */
export function zeilenSumme(zeile) {
  const adet = Number(zeile?.qty) || 0;
  const preis = Number(zeile?.price) || 0;
  return preis * adet + aufpreisSumme(zeile);
}
