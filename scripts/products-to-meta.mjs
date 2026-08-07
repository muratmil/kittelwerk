// data/products.js içindeki ürün YAPISINI (fotoğraf, renk, beden, ölçü tablosu,
// baskı seçenekleri) products.meta sütununa taşıyan SQL'i üretir.
//
//   node scripts/products-to-meta.mjs > supabase/seed-products-meta.sql
//
// Neden: fiyat zaten veritabanındaydı ama yapı kodda kalmıştı, bu yüzden
// portalın sipariş ekranları dükkânın repo'suna bağlıydı. CCH kendi projesine
// çıkacağı için o bağın kopması gerekiyordu — artık iki uygulama da yapıyı
// aynı yerden, veritabanından okuyor.
//
// data/products.js SİLİNMEDİ: kaynak metin olarak duruyor, yeni ürün hâlâ
// oraya yazılıp bu betikle veritabanına basılıyor. Çalışma anında kimse
// dosyayı okumuyor.
import { PRODUCTS } from '../data/products.js';

// Bunlar products tablosunun kendi sütunları — meta'ya kopyalanmıyorlar ki
// aynı bilgi iki yerde durup birbirinden sapmasın.
const SUTUN_OLANLAR = new Set([
  'id', 'name', 'category', 'comingSoon', 'minQty', 'tiers', 'newPrice',
]);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const out = [];

for (const p of PRODUCTS) {
  const meta = Object.fromEntries(
    Object.entries(p).filter(([k, v]) => !SUTUN_OLANLAR.has(k) && v !== undefined)
  );
  out.push(
    `update public.products set meta = ${q(JSON.stringify(meta))}::jsonb ` +
    `where site_id = 'kittelwerk' and id = ${q(p.id)};`
  );
}

console.log(out.join('\n'));
