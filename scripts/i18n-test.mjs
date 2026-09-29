// Çok dil testleri (2026-09-29) — sunucu gerekmez.
//   node scripts/i18n-test.mjs
//
// 1. Almanca sözlükteki her anahtar diğer dillerde de var mı (eksik çeviri
//    sayfada Almanca görünür — sessiz kalmasın diye burada yakalanıyor)
// 2. {n} gibi yer tutucular her dilde aynı mı (biri eksikse sayı kaybolur)
// 3. Diziler aynı uzunlukta mı (SSS, adımlar, tablo satırları)
// 4. Adres yardımcısı, fotoğraf etiketi çevirisi, bakım simgeleri
import assert from 'node:assert/strict';
import { SOZLUKLER, woerterbuch, fuell } from '../lib/i18n/index.js';
import { LOCALES, pfad, ohneSprache, alternates } from '../lib/i18n/config.js';
import { lokalisiereMeta, labelUebersetzen, produktName } from '../lib/produktSprache.js';
import { pflegeIcon } from '../lib/pflegeIcon.js';
import { PRODUKT_UEBERSETZUNGEN } from '../data/produkt-uebersetzungen.js';

let n = 0;
const hatalar = [];
const t = (ad, fn) => {
  try { fn(); n += 1; } catch (e) { hatalar.push(`${ad}: ${e.message}`); }
};

// Almanca'da bilerek boş olan alanlar (yalnız çevirilerde dolu).
const BILEREK_BOS = new Set(['recht.massgeblich', 'druckinfo.logo.titel1']);
// Renk tablosu Almanca'da boş (anahtar = Almanca ad).
const NUR_UEBERSETZUNG = new Set(['farben']);

function vergleiche(de, ue, lang, yol = '') {
  if (NUR_UEBERSETZUNG.has(yol)) return;
  if (Array.isArray(de)) {
    if (!Array.isArray(ue)) { hatalar.push(`${lang}: ${yol} dizi değil`); return; }
    if (de.length !== ue.length) hatalar.push(`${lang}: ${yol} uzunluk ${ue.length} ≠ ${de.length}`);
    de.forEach((x, i) => vergleiche(x, ue[i], lang, `${yol}[${i}]`));
    return;
  }
  if (de && typeof de === 'object') {
    for (const k of Object.keys(de)) {
      const alt = yol ? `${yol}.${k}` : k;
      if (!(k in (ue ?? {}))) { hatalar.push(`${lang}: EKSİK ${alt}`); continue; }
      vergleiche(de[k], ue[k], lang, alt);
    }
    return;
  }
  if (typeof de === 'string') {
    if (typeof ue !== 'string') { hatalar.push(`${lang}: ${yol} metin değil`); return; }
    if (!ue.trim() && de.trim() && !BILEREK_BOS.has(yol)) hatalar.push(`${lang}: ${yol} boş`);
    const yer = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    if (yer(de) !== yer(ue)) hatalar.push(`${lang}: ${yol} yer tutucu {${yer(ue)}} ≠ {${yer(de)}}`);
  }
}

for (const lang of LOCALES.filter((l) => l !== 'de')) {
  const once = hatalar.length;
  vergleiche(SOZLUKLER.de, SOZLUKLER[lang], lang);
  if (hatalar.length === once) n += 1;
}

t('çeviri gerekenlerde "bağlayıcı olan Almanca" notu var', () => {
  for (const lang of LOCALES.filter((l) => l !== 'de')) assert.ok(woerterbuch(lang).recht.massgeblich.length > 20, lang);
  assert.equal(woerterbuch('de').recht.massgeblich, '');
});

t('eksik anahtar Almanca\'ya düşer', () => {
  assert.equal(woerterbuch('xx').nav.produkte, 'Produkte');
});

t('fuell yer tutucuları doldurur', () => {
  assert.equal(fuell('Min. {min} Stück', { min: 10 }), 'Min. 10 Stück');
  assert.equal(fuell('{a} {b}', { a: 1 }), '1 {b}');
});

t('adres yardımcısı', () => {
  assert.equal(pfad('de', '/produkte'), '/produkte');
  assert.equal(pfad('en', '/produkte'), '/en/produkte');
  assert.equal(pfad('tr', '/'), '/tr');
  assert.equal(pfad('en', '/#rechner'), '/en#rechner');
  assert.equal(pfad('en', '/druckinfo#logo'), '/en/druckinfo#logo');
  assert.equal(pfad('en', 'https://wa.me/1'), 'https://wa.me/1');
  assert.equal(pfad('en', 'mailto:a@b.de'), 'mailto:a@b.de');
  assert.equal(ohneSprache('/en/produkte/tshirt'), '/produkte/tshirt');
  assert.equal(ohneSprache('/tr'), '/');
  assert.equal(ohneSprache('/produkte'), '/produkte');
  assert.equal(ohneSprache('/entdecken'), '/entdecken'); // "en" ile başlayan ama dil olmayan
});

t('hreflang: her dil + x-default, Almanca kökte', () => {
  const a = alternates('tr', '/produkte');
  assert.equal(a.canonical, 'https://www.kittelwerk.de/tr/produkte');
  assert.equal(a.languages.de, 'https://www.kittelwerk.de/produkte');
  assert.equal(a.languages['x-default'], 'https://www.kittelwerk.de/produkte');
  assert.deepEqual(Object.keys(a.languages).sort(), [...LOCALES, 'x-default'].sort());
});

t('ürün metni: çeviri varsa o, yoksa Almanca', () => {
  const meta = { desc: 'Deutsch', longDesc: 'Lang', details: ['A: b'], i18n: { en: { desc: 'English', details: ['X: y'] } } };
  const en = lokalisiereMeta(meta, 'en');
  assert.equal(en.desc, 'English');
  assert.equal(en.longDesc, 'Lang');
  assert.deepEqual(en.details, ['X: y']);
  assert.equal(lokalisiereMeta(meta, 'de'), meta);
  assert.equal(produktName(meta, 'T-Shirt', 'tr'), 'T-Shirt');
  assert.equal(produktName({ i18n: { tr: { name: 'Tişört' } } }, 'T-Shirt', 'tr'), 'Tişört');
});

t('ölçü tablosu ve kumaş seçenekleri anahtarını korur', () => {
  const meta = {
    sizeChart: { note: 'N', rows: [{ label: 'Brust', values: [1, 2] }] },
    fabricOptions: [{ value: 'a', label: 'L', weight: '290 g' }],
    i18n: { en: { sizeChart: { note: 'Note', rows: ['Chest'] }, fabricOptions: { a: { label: 'Label' } } } },
  };
  const en = lokalisiereMeta(meta, 'en');
  assert.deepEqual(en.sizeChart.rows[0], { label: 'Chest', values: [1, 2] });
  assert.deepEqual(en.fabricOptions[0], { value: 'a', label: 'Label', weight: '290 g' });
});

t('fotoğraf etiketleri parça parça çevrilir, renk anahtarı değişmez', () => {
  assert.equal(labelUebersetzen('Vorderansicht · Damen · Weiß', 'en'), 'Front view · Women · White');
  assert.equal(labelUebersetzen('Kundenbeispiel Rot — Rückendruck', 'tr'), 'Müşteri örneği Kırmızı — Sırt baskısı');
  assert.equal(labelUebersetzen('Am Modell — Schwarz (Damen)', 'en'), 'On the model — Black (Women)');
  assert.equal(labelUebersetzen('Vorderansicht', 'de'), 'Vorderansicht');
  const g = lokalisiereMeta({ gallery: [{ src: 'x', label: 'Rückansicht', farbe: 'Schwarz' }] }, 'en').gallery[0];
  assert.equal(g.label, 'Back view');
  assert.equal(g.farbe, 'Schwarz');
});

t('bakım simgeleri üç dilde aynı', () => {
  const ciftler = [
    ['Maschinenwäsche bis 40°C', 'Machine wash up to 40°C', 'Makinede 40°C’ye kadar yıkama', '🧺'],
    ['Nicht bleichen', 'Do not bleach', 'Ağartıcı kullanmayın', '🚫'],
    ['Trockner geeignet (niedrige Stufe)', 'Tumble dry (low setting)', 'Kurutma makinesine uygun (düşük ısı)', '💨'],
    ['Bügeln bis 150°C', 'Iron up to 150°C', '150°C’ye kadar ütüleme', '🌡️'],
    ['Nicht chemisch reinigen', 'Do not dry clean', 'Kuru temizleme yapmayın', '⚗️'],
  ];
  for (const [de, en, tr, icon] of ciftler) {
    assert.equal(pflegeIcon(de), icon, de);
    assert.equal(pflegeIcon(en), icon, en);
    assert.equal(pflegeIcon(tr), icon, tr);
  }
});

t('ürün çevirilerinde her ürün her dilde tam', () => {
  const ALANLAR = ['name', 'desc', 'longDesc', 'details', 'washing', 'deliveryTime'];
  for (const [id, diller] of Object.entries(PRODUKT_UEBERSETZUNGEN)) {
    for (const lang of LOCALES.filter((l) => l !== 'de')) {
      for (const a of ALANLAR) assert.ok(diller[lang]?.[a], `${id}.${lang}.${a} eksik`);
    }
    assert.equal(diller.en.details.length, diller.tr.details.length, `${id} details`);
    assert.equal(diller.en.washing.length, diller.tr.washing.length, `${id} washing`);
  }
});

if (hatalar.length) {
  console.error(`✗ ${hatalar.length} sorun:\n  ${hatalar.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${n} kontrol geçti — sözlükler (${LOCALES.join(', ')}) tutarlı.`);
