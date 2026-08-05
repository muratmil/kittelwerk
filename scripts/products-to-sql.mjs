// data/products.js içindeki ürünleri ve kademeli fiyatları SQL'e çevirir.
// Elle yazmak yerine kaynaktan üretiliyor ki fiyatlar birebir aynı olsun.
//   node scripts/products-to-sql.mjs > supabase/seed-products.sql
import { PRODUCTS } from '../data/products.js';

const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const out = [];

// Not: Supabase CLI'nin seed batch ayırıcısı yorum satırlarında takılıyor,
// bu yüzden çıktıya hiç yorum koymuyoruz. Dosyanın nasıl üretildiği bu script'te.

PRODUCTS.forEach((p, i) => {
  const tiers = p.tiers ?? [];
  const base = tiers.length ? tiers[0].price : (p.newPrice ?? null);
  out.push(
    `insert into public.products (site_id, id, name, category, coming_soon, sort_order, min_qty, price_mode, cost_currency) values (` +
    `'kittelwerk', ${q(p.id)}, ${q(p.name)}, ${q(p.category)}, ${p.comingSoon ? 'true' : 'false'}, ${i}, ` +
    `${p.minQty ?? 10}, 'manuell', 'TRY');`
  );

  if (tiers.length) {
    const rows = tiers
      .map((t) => `('kittelwerk', ${q(p.id)}, ${t.minQty}, ${t.price.toFixed(2)})`)
      .join(',\n  ');
    out.push(`insert into public.product_prices (site_id, product_id, min_qty, price) values\n  ${rows};`);
  } else if (base != null) {
    out.push(
      `insert into public.product_prices (site_id, product_id, min_qty, price) values ` +
      `('kittelwerk', ${q(p.id)}, ${p.minQty ?? 10}, ${Number(base).toFixed(2)});`
    );
  }
  out.push('');
});

console.log(out.join('\n'));
