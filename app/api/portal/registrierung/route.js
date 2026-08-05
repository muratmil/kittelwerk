import { serviceClient, writeAudit, json } from '@/lib/api';

// Herkese açık kayıt — bayi ve atölye için. Hesap açılır ama PASİF gelir;
// onaylanana kadar hiçbir veriye erişemez (RLS zaten rolü üzerinden sınırlar,
// aktiflik de haendler.active / werkstaetten.active ile tutuluyor).
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const art = body.art === 'werkstatt' ? 'werkstatt' : 'haendler';

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const company = String(body.company ?? '').trim();

  if (!email.includes('@')) return json({ error: 'Gültige E-Mail erforderlich.' }, 400);
  if (password.length < 10) return json({ error: 'Passwort muss mindestens 10 Zeichen haben.' }, 400);
  if (!company) return json({ error: art === 'werkstatt' ? 'Name der Werkstatt fehlt.' : 'Firmenname fehlt.' }, 400);

  const svc = serviceClient();

  const { data: created, error: authError } = await svc.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (authError) {
    const taken = /already|exists|registered/i.test(authError.message);
    return json({ error: taken ? 'Diese E-Mail ist bereits registriert.' : authError.message }, 400);
  }

  const rollback = async (msg) => {
    await svc.auth.admin.deleteUser(created.user.id);
    return json({ error: msg }, 500);
  };

  if (art === 'werkstatt') {
    const { data: shop, error } = await svc
      .from('werkstaetten')
      .insert({
        name: company,
        contact_name: body.contact_name?.trim() || null,
        email,
        phone: body.phone?.trim() || null,
        active: false,
      })
      .select('id')
      .single();
    if (error) return rollback(error.message);

    const { error: profileError } = await svc
      .from('profiles')
      .update({ role: 'werkstatt', werkstatt_id: shop.id, company, email })
      .eq('id', created.user.id);
    if (profileError) {
      await svc.from('werkstaetten').delete().eq('id', shop.id);
      return rollback(profileError.message);
    }

    await writeAudit(svc, created.user.id, 'werkstatt_registriert', 'werkstatt', shop.id, { company, email });
    return json({ ok: true });
  }

  // --- bayi ---
  const { error: profileError } = await svc
    .from('profiles')
    .update({ role: 'haendler', company, email })
    .eq('id', created.user.id);
  if (profileError) return rollback(profileError.message);

  const { data: dealer, error: dealerError } = await svc
    .from('haendler')
    .insert({
      profile_id: created.user.id,
      company,
      contact_name: body.contact_name?.trim() || null,
      email,
      phone: body.phone?.trim() || null,
      street: body.street?.trim() || null,
      plz: body.plz?.trim() || null,
      city: body.city?.trim() || null,
      steuer_id: body.steuer_id?.trim() || null,
      gewerbe_info: body.gewerbe_info?.trim() || null,
      active: false,
    })
    .select('id')
    .single();
  if (dealerError) return rollback(dealerError.message);

  await writeAudit(svc, created.user.id, 'haendler_registriert', 'haendler', dealer.id, { company, email });
  return json({ ok: true });
}
