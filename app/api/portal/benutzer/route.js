import { getActor, getTarget, serviceClient, generatePassword, writeAudit, json } from '@/lib/api';
import {
  canCreateRole, permissionsAllowed, canDelete, canEditPermissions, describeDenial,
} from '@/lib/authz';

// Kullanıcı açma / yetki düzenleme / silme.
// Kuralların tamamı lib/authz.js'te; burada yalnızca uygulanıyorlar.
// Arayüz de aynı fonksiyonları kullanıyor, ama karar burada veriliyor —
// tarayıcıdan gelen hiçbir şeye güvenmiyoruz.

export async function POST(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '').trim().toLowerCase();
  const role = String(body.role ?? '');
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  const werkstattId = body.werkstatt_id || null;
  const company = body.company ? String(body.company).trim() : null;

  if (!email || !email.includes('@')) return json({ error: 'Gültige E-Mail erforderlich.' }, 400);

  if (!canCreateRole(actor, role)) {
    return json({ error: role === 'admin'
      ? 'Nur der Inhaber darf Admin-Konten anlegen.'
      : 'Für diese Rolle fehlt Ihnen die Berechtigung.' }, 403);
  }

  // Kimse sahip olmadığı yetkiyi veremez.
  if (role === 'admin' && !permissionsAllowed(actor, permissions)) {
    return json({ error: 'Sie können nur Berechtigungen vergeben, die Sie selbst besitzen.' }, 403);
  }

  // Atölyesiz werkstatt kaydı veritabanı kısıtına takılır; önce açıklayalım.
  if (role === 'werkstatt' && !werkstattId) {
    return json({ error: 'Für ein Werkstatt-Konto muss eine Werkstatt gewählt werden.' }, 400);
  }

  const svc = serviceClient();
  const password = generatePassword();

  const { data: created, error: createError } = await svc.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (createError) {
    const taken = /already|exists|registered/i.test(createError.message);
    return json({ error: taken ? 'Diese E-Mail wird bereits verwendet.' : createError.message }, 400);
  }

  const { error: profileError } = await svc
    .from('profiles')
    .update({
      role,
      permissions: role === 'admin' ? permissions : [],
      werkstatt_id: role === 'werkstatt' ? werkstattId : null,
      company,
      created_by: actor.id,
      email,
    })
    .eq('id', created.user.id);

  if (profileError) {
    // Profil kurulamadıysa yarım hesap bırakmayalım.
    await svc.auth.admin.deleteUser(created.user.id);
    return json({ error: profileError.message }, 500);
  }

  await writeAudit(svc, actor.id, 'benutzer_angelegt', 'profile', created.user.id,
    { email, role, permissions: role === 'admin' ? permissions : [] });

  // Şifre yalnızca burada, bir kez dönüyor; hiçbir yerde saklanmıyor.
  return json({ ok: true, id: created.user.id, password });
}

export async function PATCH(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);

  const { id, permissions } = await request.json().catch(() => ({}));
  if (!id || !Array.isArray(permissions)) return json({ error: 'Ungültige Anfrage.' }, 400);

  const svc = serviceClient();
  const target = await getTarget(svc, id);
  if (!target) return json({ error: 'Konto nicht gefunden.' }, 404);

  if (!canEditPermissions(actor, target)) {
    return json({ error: describeDenial(actor, target, 'edit') }, 403);
  }
  if (!permissionsAllowed(actor, permissions)) {
    return json({ error: 'Sie können nur Berechtigungen vergeben, die Sie selbst besitzen.' }, 403);
  }

  const { error } = await svc.from('profiles').update({ permissions }).eq('id', id);
  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'berechtigungen_geaendert', 'profile', id,
    { vorher: target.permissions, nachher: permissions });

  return json({ ok: true });
}

export async function DELETE(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);

  const { id } = await request.json().catch(() => ({}));
  if (!id) return json({ error: 'Ungültige Anfrage.' }, 400);

  const svc = serviceClient();
  const target = await getTarget(svc, id);
  if (!target) return json({ error: 'Konto nicht gefunden.' }, 404);

  if (!canDelete(actor, target)) {
    return json({ error: describeDenial(actor, target, 'delete') }, 403);
  }

  // auth.users silinince profiles satırı da gidiyor (on delete cascade).
  const { error } = await svc.auth.admin.deleteUser(id);
  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'benutzer_geloescht', 'profile', id,
    { email: target.email, role: target.role });

  return json({ ok: true });
}
