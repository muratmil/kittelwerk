// Ürün çevirilerini (data/produkt-uebersetzungen.js) veritabanına yazar.
//
//   node scripts/push-produkt-uebersetzungen.mjs          (.env.local'deki veritabanı)
//   node scripts/push-produkt-uebersetzungen.mjs --dry    (yalnız ne yazacağını söyler)
//
// YALNIZ `meta.i18n.<dil>` alanına dokunur; fotoğraf, fiyat, renk vb. aynen
// kalır. Dosyada olmayan dil (ör. ileride CCH'den girilen) silinmez.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { PRODUKT_UEBERSETZUNGEN } from '../data/produkt-uebersetzungen.js';

function envOku(dosya = '.env.local') {
  const cikti = {};
  try {
    for (const satir of readFileSync(dosya, 'utf8').split('\n')) {
      const e = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (e) cikti[e[1]] = e[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* dosya yoksa ortam değişkenleri */ }
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

for (const [id, diller] of Object.entries(PRODUKT_UEBERSETZUNGEN)) {
  const { data: satir, error: okuHata } = await db.from('products').select('meta')
    .eq('site_id', 'kittelwerk').eq('id', id).maybeSingle();
  if (okuHata || !satir) {
    console.warn(`  ${id.padEnd(12)} ATLANDI — ${okuHata?.message ?? 'veritabanında yok'}`);
    process.exitCode = 1;
    continue;
  }
  const meta = { ...satir.meta, i18n: { ...(satir.meta?.i18n ?? {}), ...diller } };
  if (dry) { console.log(`  ${id.padEnd(12)} ${Object.keys(diller).join(', ')}`); continue; }
  const { error } = await db.from('products').update({ meta })
    .eq('site_id', 'kittelwerk').eq('id', id);
  console.log(`  ${id.padEnd(12)} ${error ? `HATA: ${error.message}` : Object.keys(diller).join(', ')}`);
  if (error) process.exitCode = 1;
}
