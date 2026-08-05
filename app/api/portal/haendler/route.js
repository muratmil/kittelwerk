import { getActor, serviceClient, writeAudit, json } from '@/lib/api';
import { has } from '@/lib/authz';

// Bayi listesi ve onayı.
// Bilerek API üzerinden: bir admin bayileri YÖNETEBİLİR ama iskonto oranlarını
// GÖRMEYEBİLİR. Aynı satırın bazı sütunlarını gizlemek RLS ile yapılamıyor
// (herkes aynı `authenticated` rolüyle bağlanıyor), o yüzden alanları burada
// ayıklıyoruz — orders_produktion görünümüyle aynı mantık.
const strip = (row, maySeeConditions) => {
  const base = {
    id: row.id, company: row.company, contact_name: row.contact_name,
    email: row.email, phone: row.phone, city: row.city, plz: row.plz, street: row.street,
    steuer_id: row.steuer_id, gewerbe_info: row.gewerbe_info,
    active: row.active, created_at: row.created_at,
  };
  return maySeeConditions
    ? { ...base, discount_rate: row.discount_rate, custom_prices: row.custom_prices }
    : base;
};

export async function GET() {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);
  if (!has(actor, 'haendler_verwalten') && !has(actor, 'haendler_konditionen')) {
    return json({ error: 'Kein Zugriff.' }, 403);
  }

  const svc = serviceClient();
  const { data, error } = await svc.from('haendler').select('*').order('created_at');
  if (error) return json({ error: error.message }, 500);

  return json({ haendler: (data ?? []).map((r) => strip(r, has(actor, 'haendler_konditionen'))) });
}

export async function PATCH(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);
  if (!has(actor, 'haendler_verwalten')) return json({ error: 'Kein Zugriff.' }, 403);

  const { id, active, discount_rate } = await request.json().catch(() => ({}));
  if (!id) return json({ error: 'Ungültige Anfrage.' }, 400);

  const patch = {};
  if (typeof active === 'boolean') patch.active = active;

  if (discount_rate != null) {
    // İskonto bir KOŞUL; görme yetkisi olmayan onu değiştiremez de.
    if (!has(actor, 'haendler_konditionen')) {
      return json({ error: 'Für Konditionen fehlt Ihnen die Berechtigung.' }, 403);
    }
    const rate = Number(discount_rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 90) {
      return json({ error: 'Rabatt muss zwischen 0 und 90 % liegen.' }, 400);
    }
    patch.discount_rate = rate;
  }

  if (Object.keys(patch).length === 0) return json({ error: 'Nichts zu ändern.' }, 400);

  const svc = serviceClient();
  const { error } = await svc.from('haendler').update(patch).eq('id', id);
  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'haendler_geaendert', 'haendler', id, patch);
  return json({ ok: true });
}
