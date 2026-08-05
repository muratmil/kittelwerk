// Fiyat hesabının testi.  node scripts/pricing-test.mjs
import {
  tierFor, costInEur, applyRounding, marginFor, effectivePrice,
  realisedMargin, isLowMargin, haendlerPrice, shippingFor,
} from '../lib/pricing.js';

let pass = 0, fail = 0;
const t = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${name}\n      beklenen: ${JSON.stringify(expected)}\n      gelen:    ${JSON.stringify(actual)}`); }
};

const tiers = [
  { min_qty: 10, price: 16 }, { min_qty: 20, price: 15 }, { min_qty: 30, price: 14 },
  { min_qty: 50, price: 12 }, { min_qty: 100, price: 11 },
];
const settings = { round_to: 1.0, round_mode: 'up', low_margin_threshold: 35 };

console.log('\n— Kademe seçimi —');
t('10 adet',            tierFor(tiers, 10).price, 16);
t('19 adet alt kademe', tierFor(tiers, 19).price, 16);
t('20 adet',            tierFor(tiers, 20).price, 15);
t('75 adet',            tierFor(tiers, 75).price, 12);
t('500 adet en üst',    tierFor(tiers, 500).price, 11);
t('5 adet — asgarinin altı en düşük kademeye düşer', tierFor(tiers, 5).price, 16);

console.log('\n— Kur ve maliyet —');
t('TL maliyet euroya',  costInEur({ cost_price: 210, cost_currency: 'TRY' }, 0.0244), 5.124);
t('euro maliyet aynen', costInEur({ cost_price: 6.5, cost_currency: 'EUR' }, 0.0244), 6.5);
t('kur yoksa null',     costInEur({ cost_price: 210, cost_currency: 'TRY' }, null), null);
t('maliyet yoksa null', costInEur({ cost_price: null, cost_currency: 'TRY' }, 0.0244), null);

console.log('\n— Yuvarlama (yukarı, tam euro) —');
t('7,17 → 8',    applyRounding(7.1669, settings), 8);
t('19,00 → 19',  applyRounding(19, settings), 19);
t('19,01 → 20',  applyRounding(19.01, settings), 20);
t('kuruş adımı (Wipello)', applyRounding(0.0812, { round_to: 0.01, round_mode: 'up' }), 0.09);
t('en yakına',   applyRounding(7.4, { round_to: 1, round_mode: 'nearest' }), 7);
t('aşağı',       applyRounding(7.9, { round_to: 1, round_mode: 'down' }), 7);

console.log('\n— Manuel mod (Kittelwerk) —');
{
  const p = { id: 'tshirt', price_mode: 'manuell', cost_price: 210, cost_currency: 'TRY', category: 'bekleidung' };
  const r = effectivePrice(p, tiers, 30, { rate: 0.0244, settings });
  t('fiyat elle girilenden', r.price, 14);
  t('kaynak manuell', r.source, 'manuell');
  t('maliyet euro', Math.round(r.costEur * 100) / 100, 5.12);
  t('gerçekleşen marj', r.margin, 63.4);
  t('marj eşiğin üstünde', isLowMargin(r.margin, settings), false);
}
{
  // Maliyet artınca elle fiyatlanan ürün kendini DÜZELTMEZ — marj sessizce düşer.
  const p = { id: 'tshirt', price_mode: 'manuell', cost_price: 420, cost_currency: 'TRY', category: 'bekleidung' };
  const r = effectivePrice(p, tiers, 30, { rate: 0.0244, settings });
  t('fiyat değişmedi', r.price, 14);
  t('marj düştü', r.margin, 26.8);
  t('düşük marj uyarısı', isLowMargin(r.margin, settings), true);
}

console.log('\n— Marj modu (Wipello/Kutuharf) —');
{
  const p = { id: 'x', price_mode: 'marge', cost_price: 210, cost_currency: 'TRY', category: 'bekleidung' };
  const defaults = [{ scope: 'global', min_qty: 30, margin: 60 }];
  // 5,124 € × 1,60 = 8,1984 → yukarı tam euro → 9
  const r = effectivePrice(p, tiers, 30, { rate: 0.0244, settings, marginDefaults: defaults });
  t('hesaplandı ve yukarı yuvarlandı', r.price, 9);
  t('kaynak marge', r.source, 'marge');
  t('elle girilen 14 € devre dışı — marj modu kazanır', r.price !== 14, true);
}
{
  // 5.124 × 1.60 = 8.1984 → yukarı tam euro → 9
  const p = { id: 'x', price_mode: 'marge', cost_price: 210, cost_currency: 'TRY' };
  const r = effectivePrice(p, [{ min_qty: 10, price: null, margin: 60 }], 10, { rate: 0.0244, settings });
  t('kademe marjı önceliklidir', r.price, 9);
}
{
  // Kur yoksa marge hesaplanamaz — elle fiyata düşer, vitrin boş kalmaz
  const p = { id: 'x', price_mode: 'marge', cost_price: 210, cost_currency: 'TRY' };
  const r = effectivePrice(p, tiers, 30, { rate: null, settings });
  t('kur yoksa elle fiyata düşer', r.price, 14);
  t('kaynak manuell', r.source, 'manuell');
}

console.log('\n— Marj devralma —');
{
  const defaults = [
    { scope: 'global', min_qty: 30, margin: 50 },
    { scope: 'bekleidung', min_qty: 30, margin: 65 },
  ];
  const tier = { min_qty: 30, price: 14, margin: null };
  t('kategori genelden önce', marginFor({ category: 'bekleidung' }, tier, defaults), 65);
  t('kategori yoksa genel',   marginFor({ category: 'schuerzen' }, tier, defaults), 50);
  t('ürün marjı en önce',     marginFor({ category: 'bekleidung', margin_override: 80 }, tier, defaults), 80);
  t('kademe marjı hepsinden önce',
    marginFor({ category: 'bekleidung', margin_override: 80 }, { min_qty: 30, margin: 42 }, defaults), 42);
}

console.log('\n— Bayi fiyatı —');
t('yüzde iskonto',      haendlerPrice(20, 'tshirt', { discount_rate: 18 }), 16.4);
t('ürüne özel fiyat',   haendlerPrice(20, 'tshirt', { discount_rate: 18, custom_prices: { tshirt: 13.5 } }), 13.5);
t('iskonto yoksa aynı', haendlerPrice(20, 'tshirt', { discount_rate: 0 }), 20);

console.log('\n— Kargo —');
t('küçük sipariş', shippingFor(50), 6.90);
t('orta sipariş',  shippingFor(150), 14.90);
t('300+ bedava',   shippingFor(300), 0);

console.log(`\n${fail === 0 ? '✓' : '✗'} ${pass} geçti, ${fail} kaldı\n`);
process.exit(fail === 0 ? 0 : 1);
