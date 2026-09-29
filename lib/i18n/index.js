import { DEFAULT_LOCALE, istSprache } from './config.js';
import de from './de/index.js';
import en from './en/index.js';
import tr from './tr/index.js';

// Sözlükler. Eksik anahtar Almanca'ya düşer: yarım çeviri sayfayı bozmaz,
// yalnız o satır Almanca görünür. Eksikleri `npm run test:i18n` yakalar.
const SOZLUKLER = { de, en, tr };

function birlestir(taban, ust) {
  if (Array.isArray(taban) || typeof taban !== 'object' || taban === null) return ust ?? taban;
  const sonuc = { ...taban };
  for (const k of Object.keys(ust ?? {})) {
    sonuc[k] = k in taban ? birlestir(taban[k], ust[k]) : ust[k];
  }
  return sonuc;
}

const onbellek = {};

/** Dilin tam sözlüğü (Almanca yedekli). */
export function woerterbuch(lang) {
  const l = istSprache(lang) ? lang : DEFAULT_LOCALE;
  if (!onbellek[l]) onbellek[l] = l === DEFAULT_LOCALE ? de : birlestir(de, SOZLUKLER[l]);
  return onbellek[l];
}

/** '{n} Stück' gibi yer tutucuları doldurur. */
export function fuell(text, werte = {}) {
  return String(text ?? '').replace(/\{(\w+)\}/g, (_, k) => (k in werte ? werte[k] : `{${k}}`));
}

export { SOZLUKLER };
