// Portal API uçlarının yetki testi — gerçek oturumlarla, gerçek HTTP üzerinden.
// lib/authz.js'in birim testleri kuralları doğruluyor; bu script kuralların
// uçlarda GERÇEKTEN uygulandığını doğruluyor.
//
// Önce `npx supabase db reset` ve `npm run dev`, sonra:
//   node scripts/portal-api-test.mjs
import { readFileSync } from 'fs';

const APP = 'http://127.0.0.1:3000';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const API = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const COOKIE = 'sb-127-auth-token';

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`); }
}

/** Oturum açıp @supabase/ssr'ın beklediği çerezi kuruyor. */
async function login(email, password = 'portal1234') {
  const res = await fetch(`${API}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const session = await res.json();
  if (!session.access_token) throw new Error(`Anmeldung fehlgeschlagen (${email}): ${session.error_description ?? session.msg}`);

  const raw = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64');
  const chunks = [];
  for (let i = 0; i < raw.length; i += 3180) chunks.push(raw.slice(i, i + 3180));
  return chunks.length === 1
    ? `${COOKIE}=${chunks[0]}`
    : chunks.map((c, i) => `${COOKIE}.${i}=${c}`).join('; ');
}

async function call(cookie, path, method, body) {
  const res = await fetch(APP + path, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const uniq = () => Math.random().toString(36).slice(2, 8);

// `db reset` biter bitmez çalıştırılırsa seed henüz yüklenmemiş olabiliyor ve
// testler sahte 403'lerle düşüyor. Veri hazır olana kadar bekliyoruz.
const svcHeadersEarly = {
  apikey: env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
};
for (let i = 0; i < 30; i++) {
  try {
    const rows = await (await fetch(
      `${API}/rest/v1/profiles?select=permissions&email=eq.admin2@kittelwerk.de`,
      { headers: svcHeadersEarly })).json();
    if (rows?.[0]?.permissions?.length > 0) break;
  } catch { /* stack henüz hazır değil */ }
  if (i === 29) throw new Error('Seed verisi 30 saniyede hazır olmadı.');
  await new Promise((r) => setTimeout(r, 1000));
}

const owner    = await login('murat@kittelwerk.de');
const admin2   = await login('admin2@kittelwerk.de');   // yalnızca werkstatt yetkileri
const vertrieb = await login('vertrieb@kittelwerk.de');
const atolyeA  = await login('atolye-a@kittelwerk.de');

// Kimlikler
const svcHeaders = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}` };
const profiles = await (await fetch(`${API}/rest/v1/profiles?select=id,email,role,is_owner`, { headers: svcHeaders })).json();
const idOf = (mail) => profiles.find((p) => p.email === mail)?.id;

console.log('\n=== Rol açma ===');
{
  const r = await call(admin2, '/api/portal/benutzer', 'POST',
    { email: `x${uniq()}@t.local`, role: 'admin', permissions: [] });
  check('kısıtlı admin ADMIN açamaz → 403', r.status === 403, `HTTP ${r.status} ${JSON.stringify(r.data)}`);
}
{
  const r = await call(admin2, '/api/portal/benutzer', 'POST',
    { email: `x${uniq()}@t.local`, role: 'vertrieb' });
  check('kısıtlı admin VERTRIEB açamaz (yetkisi yok) → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(vertrieb, '/api/portal/benutzer', 'POST',
    { email: `x${uniq()}@t.local`, role: 'haendler' });
  check('vertrieb kullanıcı açamaz → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const shops = await (await fetch(`${API}/rest/v1/werkstaetten?select=id&limit=1`, { headers: svcHeaders })).json();
  const r = await call(admin2, '/api/portal/benutzer', 'POST',
    { email: `w${uniq()}@t.local`, role: 'werkstatt', werkstatt_id: shops[0].id });
  check('kısıtlı admin WERKSTATT açar (yetkisi var) → 200', r.status === 200, `HTTP ${r.status} ${JSON.stringify(r.data)}`);
  check('şifre bir kez dönüyor', typeof r.data.password === 'string' && r.data.password.length >= 12);
  if (r.data.id) await call(owner, '/api/portal/benutzer', 'DELETE', { id: r.data.id });
}
{
  const r = await call(admin2, '/api/portal/benutzer', 'POST',
    { email: `w${uniq()}@t.local`, role: 'werkstatt' });
  check('atölyesiz werkstatt reddediliyor → 400', r.status === 400, `HTTP ${r.status}`);
}

console.log('\n=== Yetki devri ===');
let neuerAdmin = null;
{
  const email = `adm${uniq()}@t.local`;
  const r = await call(owner, '/api/portal/benutzer', 'POST',
    { email, role: 'admin', permissions: ['werkstatt_verwalten'] });
  check('owner admin açar → 200', r.status === 200, `HTTP ${r.status} ${JSON.stringify(r.data)}`);
  neuerAdmin = r.data.id;
}
{
  const r = await call(admin2, '/api/portal/benutzer', 'PATCH',
    { id: neuerAdmin, permissions: ['preise_sehen'] });
  check('admin başka admin\'in yetkisini değiştiremez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(owner, '/api/portal/benutzer', 'PATCH',
    { id: neuerAdmin, permissions: ['werkstatt_verwalten', 'preise_sehen'] });
  check('owner yetki ekler → 200', r.status === 200, `HTTP ${r.status}`);
}
{
  const r = await call(owner, '/api/portal/benutzer', 'PATCH',
    { id: idOf('murat@kittelwerk.de'), permissions: [] });
  check('owner\'ın kendi yetkileri düzenlenemez → 403', r.status === 403, `HTTP ${r.status}`);
}

console.log('\n=== Şifre sıfırlama ===');
{
  const r = await call(admin2, '/api/portal/passwort', 'POST', { id: idOf('murat@kittelwerk.de') });
  check('admin OWNER şifresini sıfırlayamaz → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(admin2, '/api/portal/passwort', 'POST', { id: neuerAdmin });
  check('admin başka ADMIN şifresini sıfırlayamaz → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(admin2, '/api/portal/passwort', 'POST', { id: idOf('haendler@test.local') });
  check('kısıtlı admin (yetkisiz) händler şifresini sıfırlayamaz → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  // Hedef bilerek atolye-b: sifresi degisen hesapla sonradan giris denenmiyor.
  const r = await call(owner, '/api/portal/passwort', 'POST', { id: idOf('atolye-b@kittelwerk.de') });
  check('owner başka hesabın şifresini sıfırlar → 200', r.status === 200, `HTTP ${r.status}`);
  check('yeni şifre bir kez dönüyor', typeof r.data.password === 'string' && r.data.password.length >= 12);
}

console.log('\n=== Silme ===');
{
  const r = await call(admin2, '/api/portal/benutzer', 'DELETE', { id: idOf('murat@kittelwerk.de') });
  check('owner silinemez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(admin2, '/api/portal/benutzer', 'DELETE', { id: idOf('admin2@kittelwerk.de') });
  check('kimse kendini silemez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(admin2, '/api/portal/benutzer', 'DELETE', { id: neuerAdmin });
  check('admin başka admini silemez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(owner, '/api/portal/benutzer', 'DELETE', { id: neuerAdmin });
  check('owner admini siler → 200', r.status === 200, `HTTP ${r.status}`);
}

console.log('\n=== Atölye atama ===');
const orders = await (await fetch(`${API}/rest/v1/orders?select=id,werkstatt_id,order_no&werkstatt_id=is.null&limit=1`, { headers: svcHeaders })).json();
const shops = await (await fetch(`${API}/rest/v1/werkstaetten?select=id,name&order=name`, { headers: svcHeaders })).json();
{
  const r = await call(atolyeA, '/api/portal/zuweisen', 'POST',
    { order_id: orders[0].id, werkstatt_id: shops[0].id });
  check('atölye kendine iş atayamaz → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(vertrieb, '/api/portal/zuweisen', 'POST',
    { order_id: orders[0].id, werkstatt_id: shops[0].id });
  check('vertrieb iş atar → 200', r.status === 200, `HTTP ${r.status} ${JSON.stringify(r.data)}`);

  const after = await (await fetch(`${API}/rest/v1/orders?select=werkstatt_id,status&id=eq.${orders[0].id}`, { headers: svcHeaders })).json();
  check('sipariş atölyeye yazıldı', after[0]?.werkstatt_id === shops[0].id);
  check('durum üretime geçti', after[0]?.status === 'in_produktion', `durum: ${after[0]?.status}`);

  const log = await (await fetch(`${API}/rest/v1/audit_log?select=action&order=created_at.desc&limit=1`, { headers: svcHeaders })).json();
  check('iz kaydı düşüldü', log[0]?.action === 'auftrag_zugewiesen', `son kayıt: ${log[0]?.action}`);
}

console.log('\n=== Werkstatt kapatma koruması ===');
{
  const r = await call(owner, '/api/portal/werkstatt', 'PATCH', { id: shops[0].id, active: false });
  check('devam eden işi olan atölye kapatılamaz → 409', r.status === 409, `HTTP ${r.status} ${JSON.stringify(r.data)}`);
}

console.log('\n=== Kayıt ve onay ===');
const neuMail = `bayi${uniq()}@t.local`;
{
  const res = await fetch(APP + '/api/portal/registrierung', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ art: 'haendler', company: 'Test Gastro', email: neuMail, password: 'sifre12345' }),
  });
  check('bayi kaydı açılır → 200', res.status === 200, `HTTP ${res.status}`);
}
{
  const rows = await (await fetch(`${API}/rest/v1/haendler?select=id,active&email=eq.${neuMail}`, { headers: svcHeaders })).json();
  check('yeni bayi PASİF geliyor', rows[0]?.active === false, JSON.stringify(rows));

  const neuSession = await login(neuMail, 'sifre12345');
  const r = await call(neuSession, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 20 }, color: 'Schwarz', print: 'front' }] });
  check('onaysız bayi sipariş veremez → 403', r.status === 403, `HTTP ${r.status} ${JSON.stringify(r.data)}`);

  const app2 = await call(owner, '/api/portal/haendler', 'PATCH', { id: rows[0].id, active: true });
  check('owner bayiyi onaylar → 200', app2.status === 200, `HTTP ${app2.status}`);

  const r2 = await call(neuSession, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 20 }, color: 'Schwarz', print: 'front' }] });
  check('onaylı bayi sipariş verir → 200', r2.status === 200, `HTTP ${r2.status} ${JSON.stringify(r2.data)}`);
}
{
  const r = await call(vertrieb, '/api/portal/haendler', 'PATCH', { id: 'x', active: true });
  check('vertrieb bayi onaylayamaz → 403', r.status === 403, `HTTP ${r.status}`);
}

console.log('\n=== Sipariş kuralları ===');
const haendlerSession = await login('haendler@test.local');
{
  const r = await call(haendlerSession, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 3 }, color: 'Schwarz', print: 'front' }] });
  check('asgari adedin altı reddedilir → 400', r.status === 400, `HTTP ${r.status} ${JSON.stringify(r.data)}`);
}
{
  const r = await call(haendlerSession, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'kochjacke', sizes: { L: 20 }, color: 'Schwarz', print: 'none' }] });
  check('yakında olan ürün sipariş edilemez → 400', r.status === 400, `HTTP ${r.status}`);
}
{
  const r = await call(haendlerSession, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 20 }, color: 'Schwarz', print: 'front' }] });
  check('bayi sipariş verir → 200', r.status === 200, `HTTP ${r.status}`);

  const o = await (await fetch(`${API}/rest/v1/orders?select=order_no,items,total,source,haendler_id&order_no=eq.${r.data.order_no}`, { headers: svcHeaders })).json();
  // Liste 20 adette 15,00 €; bayi iskontosu %18 → 12,30 €
  check('fiyat bayi iskontosuyla hesaplandı', o[0]?.items?.[0]?.unitPrice === 12.3,
    `birim: ${o[0]?.items?.[0]?.unitPrice}`);
  check('kaynak haendler', o[0]?.source === 'haendler');
  check('bayi kimliği yazıldı', !!o[0]?.haendler_id);
}
{
  // Fiyat istemciden gelmiyor: uydurma fiyat gönderilse de sunucu kendi hesabını yazıyor.
  const r = await call(haendlerSession, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 20 }, color: 'Schwarz', print: 'front', unitPrice: 0.01 }] });
  const o = await (await fetch(`${API}/rest/v1/orders?select=items&order_no=eq.${r.data.order_no}`, { headers: svcHeaders })).json();
  check('istemciden gelen fiyat yok sayılıyor', o[0]?.items?.[0]?.unitPrice === 12.3,
    `birim: ${o[0]?.items?.[0]?.unitPrice}`);
}
{
  const r = await call(atolyeA, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 20 } }] });
  check('atölye sipariş veremez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(owner, '/api/portal/bestellung', 'POST',
    { items: [{ productId: 'tshirt', sizes: { L: 20 }, color: 'Rot', print: 'front' }] });
  check('owner şirket adına sipariş verir → 200', r.status === 200, `HTTP ${r.status}`);
  const o = await (await fetch(`${API}/rest/v1/orders?select=source,haendler_id,payment_status&order_no=eq.${r.data.order_no}`, { headers: svcHeaders })).json();
  check('kaynak intern', o[0]?.source === 'intern');
  check('bayi kimliği YOK — kimse başkası adına sipariş vermiyor', o[0]?.haendler_id === null);
  check('ödemeye uğramıyor', o[0]?.payment_status === 'nicht_erforderlich');
}

console.log('\n=== Site kapsamı ===');
{
  const r = await call(haendlerSession, '/api/portal/bestellung', 'POST',
    { site_id: 'wipello', items: [{ productId: 'triplex', sizes: { '-': 20000 } }] });
  check('siparişe kapalı sitede sipariş verilemez → 409', r.status === 409,
    `HTTP ${r.status} ${JSON.stringify(r.data)}`);
}
{
  const r = await call(owner, '/api/portal/bestellung', 'POST',
    { site_id: 'olmayan-site', items: [{ productId: 'tshirt', sizes: { L: 20 } }] });
  check('bilinmeyen site reddedilir → 400', r.status === 400, `HTTP ${r.status}`);
}

console.log('\n=== Fiyat yetkileri ===');
{
  const r = await call(vertrieb, '/api/portal/preise', 'PATCH',
    { art: 'staffel', product_id: 'tshirt', min_qty: 10, price: 1 });
  check('vertrieb SATIŞ fiyatı değiştiremez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(vertrieb, '/api/portal/preise', 'PATCH',
    { art: 'kosten', id: 'tshirt', cost_price: 230 });
  check('vertrieb ALIŞ fiyatı değiştirir → 200', r.status === 200, `HTTP ${r.status} ${JSON.stringify(r.data)}`);
}
{
  // Mutlak sayı yerine ÖNCE/SONRA farkı: test tazelenmemiş veritabanında da geçmeli.
  const kurUrl = `${API}/rest/v1/exchange_rates?select=rate&currency=eq.TRY&order=valid_from.desc`;
  const vorher = (await (await fetch(kurUrl, { headers: svcHeaders })).json()).length;
  // toFixed(6): numeric(12,6) altı haneye yuvarlıyor, JS toplamı ise
  // 0.024147000000000002 gibi bir artık bırakıyor — karşılaştırma tutmazdı.
  const yeniKur = Number((0.0239 + Math.round(Math.random() * 900) / 1e6).toFixed(6));

  const r = await call(vertrieb, '/api/portal/preise', 'POST', { currency: 'TRY', rate: yeniKur });
  check('vertrieb kur girer → 200', r.status === 200, `HTTP ${r.status}`);

  const rows = await (await fetch(kurUrl, { headers: svcHeaders })).json();
  check('kur ÜZERİNE YAZILMADI, yeni satır eklendi', rows.length === vorher + 1,
    `önce ${vorher}, sonra ${rows.length}`);
  check('en güncel kur yeni değer', Number(rows[0].rate) === yeniKur,
    `beklenen ${yeniKur}, gelen ${rows[0]?.rate}`);
}
{
  const r = await call(admin2, '/api/portal/preise', 'PATCH',
    { art: 'staffel', product_id: 'tshirt', min_qty: 10, price: 1 });
  check('fiyat yetkisi olmayan admin satış fiyatı değiştiremez → 403', r.status === 403, `HTTP ${r.status}`);
}
{
  const r = await call(owner, '/api/portal/preise', 'PATCH',
    { art: 'staffel', product_id: 'tshirt', min_qty: 10, price: 17.5 });
  check('owner satış fiyatı değiştirir → 200', r.status === 200, `HTTP ${r.status}`);
  const rows = await (await fetch(`${API}/rest/v1/product_prices?select=price&product_id=eq.tshirt&min_qty=eq.10`, { headers: svcHeaders })).json();
  check('fiyat veritabanına yazıldı', Number(rows[0].price) === 17.5, `gelen: ${rows[0]?.price}`);
}
{
  const r = await call(owner, '/api/portal/preise', 'PATCH',
    { art: 'einstellungen', round_to: 0.5, round_mode: 'up' });
  check('yuvarlama ayarı proje başına değiştirilebilir → 200', r.status === 200, `HTTP ${r.status}`);
  await call(owner, '/api/portal/preise', 'PATCH', { art: 'einstellungen', round_to: 1, round_mode: 'up' });
}

console.log(`\n${fail === 0 ? '✓' : '✗'} ${pass} geçti, ${fail} kaldı\n`);
process.exit(fail === 0 ? 0 : 1);
