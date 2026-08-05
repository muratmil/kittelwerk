import { getActor, getTarget, serviceClient, generatePassword, writeAudit, json } from '@/lib/api';
import { canResetPassword, describeDenial } from '@/lib/authz';

// Şifre sıfırlama. Kimse mevcut şifreyi göremez — Supabase yalnızca hash
// saklıyor, düz metin hiçbir yerde yok. Yapılabilecek tek şey yenisini vermek.
//
// Kritik incelik: bir admin başka bir admin'in şifresini sıfırlayabilseydi,
// o hesaba girip sahip olmadığı yetkileri kullanırdı. canResetPassword bunu
// engelliyor — admin yalnızca admin OLMAYAN hesapları sıfırlar.
export async function POST(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);

  const { id } = await request.json().catch(() => ({}));
  if (!id) return json({ error: 'Ungültige Anfrage.' }, 400);

  const svc = serviceClient();
  const target = await getTarget(svc, id);
  if (!target) return json({ error: 'Konto nicht gefunden.' }, 404);

  if (!canResetPassword(actor, target)) {
    return json({ error: describeDenial(actor, target, 'reset') }, 403);
  }

  const password = generatePassword();
  const { error } = await svc.auth.admin.updateUserById(id, { password });
  if (error) return json({ error: error.message }, 500);

  await writeAudit(svc, actor.id, 'passwort_zurueckgesetzt', 'profile', id,
    { email: target.email });

  return json({ ok: true, password });
}
