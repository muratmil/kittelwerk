import { createPublicClient } from '@/utils/supabase/public';
import { INDEX_LOCALES as LOCALES, DEFAULT_LOCALE, BASIS, pfad } from '@/lib/i18n/config';
// Yalnız Google'a açık diller (INDEX_LOCALES, 2026-10-27) — noindex sayfalar haritaya girmez.

// Ürünler veritabanından: yeni ürün eklendiğinde site haritasına elle satır
// eklemek gerekmiyor, `products` tablosuna düşen her ürün buraya da düşer.
//
// Çok dil (2026-09-29): her sayfa her dilde ayrı satır ve her satır diğer
// dillerdeki karşılıklarını `alternates.languages` ile bildiriyor (hreflang).
// Google aynı içeriğin dil sürümlerini böylece kopya saymıyor.
export default async function sitemap() {
  const now = new Date();

  const { data: produkte } = await createPublicClient()
    .from('products').select('id, meta').eq('site_id', 'kittelwerk').eq('active', true).order('sort_order');

  const seiten = [
    { pfad: '/',                          changeFrequency: 'weekly',  priority: 1.0 },
    { pfad: '/produkte',                  changeFrequency: 'weekly',  priority: 0.95 },
    // Kategori sayfaları (2026-09-23): kendi metinleriyle ayrı sayfalar
    { pfad: '/produkte/arbeitskleidung',  changeFrequency: 'weekly',  priority: 0.9 },
    { pfad: '/produkte/schuerzen',        changeFrequency: 'weekly',  priority: 0.9 },
    { pfad: '/produkte/accessoires',      changeFrequency: 'weekly',  priority: 0.9 },
    { pfad: '/referenzen',                changeFrequency: 'weekly',  priority: 0.8 },
    { pfad: '/kontakt',                   changeFrequency: 'monthly', priority: 0.8 },
    { pfad: '/ueber-uns',                 changeFrequency: 'monthly', priority: 0.7 },
    { pfad: '/druckinfo',                 changeFrequency: 'monthly', priority: 0.75 },
    { pfad: '/lieferbedingungen',         changeFrequency: 'monthly', priority: 0.6 },
    { pfad: '/impressum',                 changeFrequency: 'monthly', priority: 0.4 },
    ...(produkte ?? []).map((p) => ({
      pfad: `/produkte/${p.meta?.slug ?? p.id}`, changeFrequency: 'weekly', priority: 0.9,
    })),
  ];

  const url = (lang, p) => `${BASIS}${pfad(lang, p)}`;
  return seiten.flatMap((s) => {
    const languages = {
      ...Object.fromEntries(LOCALES.map((l) => [l, url(l, s.pfad)])),
      'x-default': url(DEFAULT_LOCALE, s.pfad),
    };
    return LOCALES.map((lang) => ({
      url: url(lang, s.pfad),
      lastModified: now,
      changeFrequency: s.changeFrequency,
      // Almanca asıl sürüm; çeviriler bir kademe düşük.
      priority: lang === 'de' ? s.priority : Math.round(s.priority * 0.8 * 100) / 100,
      alternates: { languages },
    }));
  });
}
