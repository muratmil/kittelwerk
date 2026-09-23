// Büyük beden farkının testi.  node scripts/groessen-test.mjs
//
// Para hesabı: müşterinin gördüğü tutar ile sunucunun hesapladığı tutar
// AYNI fonksiyondan çıkmalı. Burada o fonksiyonun kendisi sınanıyor.
import {
  groessenAufpreis, hatAufpreis, aufpreisSumme, zeilenSumme, STANDARD_GROESSEN,
} from '../lib/groessen.js';

let gecti = 0;
const hatalar = [];
const t = (ad, gelen, beklenen) => {
  if (JSON.stringify(gelen) === JSON.stringify(beklenen)) gecti++;
  else hatalar.push(`${ad}\n      beklenen: ${JSON.stringify(beklenen)}\n      gelen:    ${JSON.stringify(gelen)}`);
};

const tshirt = { id: 'tshirt', price: 16, sizeSurcharge: { '3XL': 1, '4XL': 1 } };
const apron = { id: 'apron', price: 12 };                       // bedensiz ürün

console.log('— Fark tablosu —');
t('3XL farkı', groessenAufpreis(tshirt, '3XL'), 1);
t('4XL farkı', groessenAufpreis(tshirt, '4XL'), 1);
t('XL farksız', groessenAufpreis(tshirt, 'XL'), 0);
t('tanımsız beden farksız', groessenAufpreis(tshirt, '5XL'), 0);
t('tablosu olmayan üründe fark yok', groessenAufpreis(apron, '3XL'), 0);
t('ürün yoksa çökmüyor', groessenAufpreis(null, '3XL'), 0);
t('negatif/bozuk değer yok sayılıyor',
  groessenAufpreis({ sizeSurcharge: { '3XL': -2, '4XL': 'abc' } }, '3XL'), 0);
t('farkı olan ürün tanınıyor', [hatAufpreis(tshirt), hatAufpreis(apron)], [true, false]);
t('standart bedenler', STANDARD_GROESSEN, ['XS', 'S', 'M', 'L', 'XL', 'XXL']);

console.log('— Satır toplamı —');
// 10 adet: 6×L + 4×3XL → 10×16 + 4×1 = 164
t('karışık bedenli satır',
  zeilenSumme({ ...tshirt, qty: 10, sizes: { L: 6, '3XL': 4 } }), 164);
t('yalnız farkların toplamı',
  aufpreisSumme({ ...tshirt, sizes: { L: 6, '3XL': 4 } }), 4);
t('farksız satır eskisi gibi',
  zeilenSumme({ ...tshirt, qty: 10, sizes: { L: 10 } }), 160);
t('3XL + 4XL birlikte',
  zeilenSumme({ ...tshirt, qty: 12, sizes: { M: 4, '3XL': 5, '4XL': 3 } }), 12 * 16 + 8);
t('bedensiz ürün (sizes: -) değişmiyor',
  zeilenSumme({ ...apron, qty: 10, sizes: { '-': 10 } }), 120);
t('sizes yoksa adet × fiyat', zeilenSumme({ ...apron, qty: 10 }), 120);
t('boş satır sıfır', zeilenSumme({}), 0);
t('kademeli fiyatla da çalışıyor (fiyat dışarıdan geliyor)',
  zeilenSumme({ ...tshirt, price: 11, qty: 100, sizes: { L: 90, '4XL': 10 } }), 100 * 11 + 10);

console.log('— Sunucu ile aynı sonuç —');
// Sipariş ucundaki hesabın birebir aynısı
const sunucuHesabi = (urun, satir, birimFiyat) => birimFiyat * satir.qty
  + Object.entries(satir.sizes ?? {}).reduce((s, [g, n]) => s + (Number(n) || 0) * groessenAufpreis(urun, g), 0);
const satir = { qty: 20, sizes: { M: 10, '3XL': 6, '4XL': 4 } };
t('istemci ve sunucu aynı tutarı buluyor',
  zeilenSumme({ ...tshirt, ...satir, price: 15 }), sunucuHesabi(tshirt, satir, 15));

if (hatalar.length) {
  console.error(`\n✗ ${hatalar.length} hata (${gecti} geçti):\n  - ${hatalar.join('\n  - ')}`);
  process.exit(1);
}
console.log(`\n✓ ${gecti} kontrol geçti`);
