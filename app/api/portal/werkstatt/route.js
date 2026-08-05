import { getActor, serviceClient, writeAudit, json } from '@/lib/api';
import { has } from '@/lib/authz';

export async function POST(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);
  if (!has(actor, 'werkstatt_verwalten')) return json({ error: 'Kein Zugriff.' }, 403);

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  if (!name) return json({ error: 'Name ist erforderlich.' }, 400);

  const svc = serviceClient();
  const { data, error } = await svc
    .from('werkstaetten')
    .insert({
      name,
      contact_name: body.contact_name?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
    })
    .select('id, name')
    .single();

  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'werkstatt_angelegt', 'werkstatt', data.id, { name });
  return json({ ok: true, werkstatt: data });
}

export async function PATCH(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);
  if (!has(actor, 'werkstatt_verwalten')) return json({ error: 'Kein Zugriff.' }, 403);

  const { id, active } = await request.json().catch(() => ({}));
  if (!id || typeof active !== 'boolean') return json({ error: 'Ungültige Anfrage.' }, 400);

  const svc = serviceClient();

  // Kapatılan atölyede devam eden iş varsa haber verelim — sessizce
  // kapatmak, o işlerin kimsenin ekranında görünmemesine yol açar.
  if (!active) {
    const { count } = await svc
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('werkstatt_id', id)
      .in('status', ['neu', 'in_produktion', 'pausiert']);
    if (count > 0) {
      return json({ error: `Diese Werkstatt hat noch ${count} laufende Aufträge. Bitte zuerst umleiten.` }, 409);
    }
  }

  const { error } = await svc.from('werkstaetten').update({ active }).eq('id', id);
  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, active ? 'werkstatt_aktiviert' : 'werkstatt_deaktiviert',
    'werkstatt', id, null);
  return json({ ok: true });
}
