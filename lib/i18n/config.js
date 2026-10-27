// Dil ayarları (2026-09-29).
//
// Almanca KÖK adreslerde kalıyor (`/produkte`) — arama motorundaki kayıtlar
// ve sıralama bozulmasın. Diğer diller ön ekli: `/en/produkte`, `/tr/produkte`.
// İçeride her sayfa `app/[lang]/` altında; `proxy.js` ön eksiz adresi
// görünmez biçimde `/de/…`'ye çeviriyor.
//
// Yeni dil eklemek: LOCALES'e ekle + `lib/i18n/<kod>.js` sözlüğü + `SPRACHEN`
// satırı. Sırada bekleyenler (Murat 2026-09-29): ru, sonra fr/it/es.
// Kiril için yazı tipi değişmeli — bkz. app/[lang]/layout.js.

export const LOCALES = ['de', 'en', 'tr', 'fr', 'es', 'it', 'ru'];
export const DEFAULT_LOCALE = 'de';

// Google'a açık diller (2026-10-27, Murat): 29.09'da 7 dil birden yayına girince site
// ~23 adresten 161'e çıktı ve 4–6 gün sonra bütün ürün sıralamaları düştü (sıra 37 → 76).
// FR/ES/IT/RU makine çevirisi; ziyaretçiye açık kalıyor ama sıralama toparlanana kadar
// noindex, site haritasında ve hreflang'da yok. Geri açmak: buraya eklemek yeter.
export const INDEX_LOCALES = ['de', 'en', 'tr'];
export const indexlenir = (lang) => INDEX_LOCALES.includes(lang);

/** Dil seçicide görünen adlar — her dil KENDİ adıyla. */
export const SPRACHEN = {
  de: { name: 'Deutsch', kurz: 'DE', og: 'de_DE' },
  en: { name: 'English', kurz: 'EN', og: 'en_US' },
  tr: { name: 'Türkçe', kurz: 'TR', og: 'tr_TR' },
  fr: { name: 'Français', kurz: 'FR', og: 'fr_FR' },
  es: { name: 'Español', kurz: 'ES', og: 'es_ES' },
  it: { name: 'Italiano', kurz: 'IT', og: 'it_IT' },
  ru: { name: 'Русский', kurz: 'RU', og: 'ru_RU' },
};

export const BASIS = 'https://www.kittelwerk.de';

export function istSprache(x) {
  return LOCALES.includes(x);
}

/**
 * Bir iç adresi dile göre ön ekler. Almanca ön eksiz kalır.
 *   pfad('en', '/produkte')  → '/en/produkte'
 *   pfad('de', '/produkte')  → '/produkte'
 *   pfad('en', '/')          → '/en'
 *   pfad('en', '/#rechner')  → '/en#rechner'
 * Dış adresler (http…, mailto:, tel:) ve yalnız çapa (#x) dokunulmadan döner.
 */
export function pfad(lang, href = '/') {
  if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  if (!href.startsWith('/')) return href;
  if (!lang || lang === DEFAULT_LOCALE) return href;
  if (href === '/') return `/${lang}`;
  if (href.startsWith('/#') || href.startsWith('/?')) return `/${lang}${href.slice(1)}`;
  return `/${lang}${href}`;
}

/** Görünen adresten dil ön ekini çıkarır: '/en/produkte' → '/produkte'. */
export function ohneSprache(pathname = '/') {
  const m = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (m && istSprache(m[1])) return m[2] || '/';
  return pathname || '/';
}

/** Metadata için: bu sayfanın bütün dillerdeki adresleri (hreflang). */
export function alternates(lang, href) {
  const languages = Object.fromEntries(INDEX_LOCALES.map((l) => [l, `${BASIS}${pfad(l, href)}`]));
  languages['x-default'] = `${BASIS}${pfad(DEFAULT_LOCALE, href)}`;
  return { canonical: `${BASIS}${pfad(lang, href)}`, languages };
}
