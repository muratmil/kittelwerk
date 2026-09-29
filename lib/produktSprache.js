// Ürün metinlerinin çevirisi (2026-09-29).
//
// Çeviriler ürünün kendi satırında: `products.meta.i18n.<dil>`. Almanca
// asıl metin olarak `meta`nın kendisinde kalıyor; bir alanın çevirisi yoksa
// Almanca görünür (yarım çeviri ürün sayfasını bozmaz).
//
//   i18n.en = {
//     name, desc, longDesc, badge, deliveryTime, marketingText,
//     details: [...], washing: [...],                 // dizi olduğu gibi değişir
//     sizeChart: { note, rows: ['Chest width', …] },  // satır etiketleri SIRAYLA
//     fabricOptions: { <value>: { label, sublabel, desc, careNote } },
//     galerie: { <src>: 'label' },                    // fotoğraf etiketleri
//   }
//
// Renk ADLARI burada çevrilmiyor: sepet, sipariş ve fotoğraf eşleşmesi
// Almanca adı anahtar olarak kullanıyor. Ekranda çeviri `useSprache().farbe()` ile.
//
// SAF dosya — `node` ile de çalışır (scripts/i18n-test.mjs).

import { woerterbuch } from './i18n/index.js';

const DUZ_ALANLAR = ['desc', 'longDesc', 'badge', 'deliveryTime', 'marketingText'];

// Fotoğraf etiketleri parçalı: "Vorderansicht · Damen · Weiß",
// "Kundenbeispiel Rot — Rückendruck". Tek tek çevirmek yerine parça parça
// çevriliyor; CCH'den eklenen yeni fotoğraf da böylece kendiliğinden çevrilir.
// Tanınmayan parça Almanca kalır. Özel çeviri gerekirse `i18n.<dil>.galerie`.
const BEGRIFFE = {
  en: {
    'Vorderansicht': 'Front view', 'Rückansicht': 'Back view', 'Seitenansicht': 'Side view',
    'Ganzkörper': 'Full length', 'Damen': 'Women', 'Herren': 'Men',
    'Mit Tasche': 'With pocket', 'Mit Taschen': 'With pockets', 'Ohne Tasche': 'Without pocket', 'Ohne Taschen': 'Without pockets',
    'Am Modell': 'On the model', 'Produkt': 'Product', 'Kundenbeispiel': 'Customer example',
    'Brust-Bestickung': 'Chest embroidery', 'Rücken-Bestickung': 'Back embroidery',
    'Rückendruck': 'Back print', 'Vorderdruck': 'Front print', 'Front': 'Front', 'Seite': 'Side',
    'Rückseite': 'Back', 'Vorderseite': 'Front', 'Bestickung Front': 'Front embroidery',
    'Mehrfarbige Bestickung': 'Multicolour embroidery', 'Mit Ihrer Logo-Bestickung': 'With your logo embroidery',
  },
  tr: {
    'Vorderansicht': 'Önden görünüm', 'Rückansicht': 'Arkadan görünüm', 'Seitenansicht': 'Yandan görünüm',
    'Ganzkörper': 'Boydan', 'Damen': 'Kadın', 'Herren': 'Erkek',
    'Mit Tasche': 'Cepli', 'Mit Taschen': 'Cepli', 'Ohne Tasche': 'Cepsiz', 'Ohne Taschen': 'Cepsiz',
    'Am Modell': 'Modelde', 'Produkt': 'Ürün', 'Kundenbeispiel': 'Müşteri örneği',
    'Brust-Bestickung': 'Göğüs nakışı', 'Rücken-Bestickung': 'Sırt nakışı',
    'Rückendruck': 'Sırt baskısı', 'Vorderdruck': 'Ön baskı', 'Front': 'Ön', 'Seite': 'Yan',
    'Rückseite': 'Arka yüz', 'Vorderseite': 'Ön yüz', 'Bestickung Front': 'Ön nakış',
    'Mehrfarbige Bestickung': 'Çok renkli nakış', 'Mit Ihrer Logo-Bestickung': 'Logo nakışınızla',
  },
};

function teilUebersetzen(teil, lang) {
  const begriffe = BEGRIFFE[lang] ?? {};
  const farben = woerterbuch(lang).farben ?? {};
  const eintrag = (w) => begriffe[w] ?? farben[w] ?? null;
  const klammer = teil.match(/^(.*?)\s*\((.+)\)$/);
  if (klammer) return `${teilUebersetzen(klammer[1], lang)} (${teilUebersetzen(klammer[2], lang)})`;
  if (eintrag(teil)) return eintrag(teil);
  // "Kundenbeispiel Rot" → önek + renk
  const m = teil.match(/^(\S+(?: \S+)?) (\S+)$/);
  if (m && eintrag(m[1]) && eintrag(m[2])) return `${eintrag(m[1])} ${eintrag(m[2])}`;
  return teil;
}

/** Fotoğraf etiketini parça parça çevirir (ayırıcılar: " · " ve " — "). */
export function labelUebersetzen(label, lang = 'de') {
  if (!label || lang === 'de') return label;
  return label.split(/( · | — )/).map((t) => (t === ' · ' || t === ' — ' ? t : teilUebersetzen(t, lang))).join('');
}

const DIZI_ALANLAR = ['details', 'washing'];

export function lokalisiereMeta(meta = {}, lang = 'de') {
  if (!meta || lang === 'de') return meta;
  const ue = meta.i18n?.[lang] ?? {};
  const neu = { ...meta };

  for (const k of DUZ_ALANLAR) if (ue[k]) neu[k] = ue[k];
  for (const k of DIZI_ALANLAR) if (Array.isArray(ue[k]) && ue[k].length) neu[k] = ue[k];

  if (meta.sizeChart && ue.sizeChart) {
    neu.sizeChart = {
      ...meta.sizeChart,
      note: ue.sizeChart.note || meta.sizeChart.note,
      rows: (meta.sizeChart.rows ?? []).map((r, i) => ({ ...r, label: ue.sizeChart.rows?.[i] || r.label })),
    };
  }
  if (Array.isArray(meta.fabricOptions) && ue.fabricOptions) {
    neu.fabricOptions = meta.fabricOptions.map((o) => ({ ...o, ...(ue.fabricOptions[o.value] ?? {}) }));
  }
  if (Array.isArray(meta.gallery)) {
    neu.gallery = meta.gallery.map((g) => (g
      ? { ...g, label: ue.galerie?.[g.src] ?? labelUebersetzen(g.label, lang) }
      : g));
  }
  return neu;
}

/** Ürün adı: çeviri varsa o, yoksa sütundaki (Almanca) ad. */
export function produktName(meta = {}, spaltenName = null, lang = 'de') {
  return (lang !== 'de' && meta?.i18n?.[lang]?.name) || spaltenName || meta?.name || '';
}
