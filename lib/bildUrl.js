// Görsel adresi (2026-09-29).
//
// CCH'den (gastrocollect) yüklenen fotoğraflar `produkt-bilder` kovasında
// duruyor ve veritabanına yalnız KOVA YOLU yazılıyor: `kittelwerk/tshirt/…webp`.
// Bu yol olduğu gibi `next/image`'a verilirse görsel kırılır (baştaki `/`
// yok). Burada üç biçimin hepsi tarayıcının açabileceği adrese çevriliyor:
//   /images/x.webp            → olduğu gibi (repodaki eski dosyalar)
//   https://…                 → olduğu gibi
//   kittelwerk/tshirt/x.webp  → https://<proje>.supabase.co/storage/v1/object/public/produkt-bilder/…
// Kova adı değişirse `next.config.mjs → images.remotePatterns` de değişmeli.
const KOVA = 'produkt-bilder';

export function bildUrl(src) {
  if (!src || typeof src !== 'string') return null;
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  const speicher = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  return `${speicher}/storage/v1/object/public/${KOVA}/${src}`;
}

/** Arama motoru / paylaşım için mutlak adres. */
export function bildUrlAbsolut(src, taban = 'https://www.kittelwerk.de') {
  const url = bildUrl(src);
  if (!url) return null;
  return url.startsWith('/') ? `${taban}${url}` : url;
}
