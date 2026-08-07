// data/products.js'teki ürün yapısını doğrudan veritabanına yazar.
//
//   node scripts/push-products-meta.mjs            (.env.local'deki veritabanı)
//   node scripts/push-products-meta.mjs --dry      (yalnız ne yazacağını söyler)
//
// `products-to-meta.mjs` SQL üretir (yerel `db reset` seed'i için); bu betik
// ise canlıya/yerele doğrudan yazar. Yeni ürün eklendiğinde ya da bir ürünün
// fotoğrafı/rengi/bedeni değiştiğinde çalıştırılması gereken budur.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../data/products.js';

// products tablosunun kendi sütunları — meta'ya kopyalanmıyorlar.
const SUTUN_OLANLAR = new Set([
  'id', 'name', 'category', 'comingSoon', 'minQty', 'tiers', 'newPrice',
]);

function envOku(dosya = '.env.local') {
  const cikti = {};
  try {
    for (const satir of readFileSync(dosya, 'utf8').split('\n')) {
      const e = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (e) cikti[e[1]] = e[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* dosya yoksa ortam değişkenlerine düşülür */ }
  return cikti;
}

const env = { ...envOku(), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_KEY gerekli.');
  process.exit(1);
}

const dry = process.argv.includes('--dry');
const db = createClient(url, key, { auth: { persistSession: false } });

console.log(`Hedef: ${url}${dry ? '  (DENEME — yazmıyor)' : ''}`);

let yazilan = 0;
let atlanan = 0;
for (const p of PRODUCTS) {
  const meta = Object.fromEntries(
    Object.entries(p).filter(([k, v]) => !SUTUN_OLANLAR.has(k) && v !== undefined)
  );

  if (dry) {
    console.log(`  ${p.id.padEnd(12)} ${Object.keys(meta).length} alan`);
    yazilan++;
    continue;
  }

  const { data, error } = await db
    .from('products')
    .update({ meta })
    .eq('site_id', 'kittelwerk')
    .eq('id', p.id)
    .select('id');

  if (error) {
    console.error(`  ${p.id.padEnd(12)} HATA: ${error.message}`);
    process.exitCode = 1;
  } else if (!data?.length) {
    // Sessizce geçmesin: koddaki ürün veritabanında yoksa yapısı hiç yazılmaz
    // ve ekranda eksik görünür — hata vermeden.
    console.warn(`  ${p.id.padEnd(12)} ATLANDI — veritabanında böyle bir ürün yok`);
    atlanan++;
  } else {
    console.log(`  ${p.id.padEnd(12)} ${Object.keys(meta).length} alan yazıldı`);
    yazilan++;
  }
}

console.log(`\n${yazilan} ürün${atlanan ? `, ${atlanan} atlandı` : ''}.`);
if (atlanan) process.exitCode = 1;
