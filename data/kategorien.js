import { woerterbuch } from '@/lib/i18n';

/**
 * Kategori sayfaları (2026-09-23). Metinler 2026-09-29'dan beri sözlükte
 * (`lib/i18n/<dil>/kategorien.js` → `kategorien.<slug>`), her dilde ayrı.
 *
 * Her kategori kendi sayfasında kendi başlığı, kendi Google açıklaması ve
 * kendi giriş metniyle duruyor — aranan kelimeler orada geçiyor.
 *
 * `key` alanı `products.category` ile birebir aynı olmalı. Adres (slug) her
 * dilde aynı: /produkte/schuerzen, /en/produkte/schuerzen.
 */
export const KATEGORIEN = [
  { slug: 'arbeitskleidung', key: 'bekleidung' },
  { slug: 'schuerzen', key: 'schuerzen' },
  { slug: 'accessoires', key: 'accessoires' },
];

/** Kategori + o dildeki metinleri. */
export function kategorieBySlug(slug, lang = 'de') {
  const k = KATEGORIEN.find((x) => x.slug === slug);
  if (!k) return null;
  return { ...k, ...woerterbuch(lang).kategorien[slug] };
}

/** Bütün kategoriler o dildeki etiketleriyle (liste sayfaları için). */
export function kategorienListe(lang = 'de') {
  return KATEGORIEN.map((k) => kategorieBySlug(k.slug, lang));
}
