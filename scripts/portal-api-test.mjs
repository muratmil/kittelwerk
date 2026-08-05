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
async function login(email) {
  const res = await fetch(`${API}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'portal1234' }),
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
  const r = await call(owner, '/api/portal/passwort', 'POST', { id: idOf('haendler@test.local') });
  check('owner händler şifresini sıfırlar → 200', r.status === 200, `HTTP ${r.status}`);
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

console.log(`\n${fail === 0 ? '✓' : '✗'} ${pass} geçti, ${fail} kaldı\n`);
process.exit(fail === 0 ? 0 : 1);
