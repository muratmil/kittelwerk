import { getActor, serviceClient, writeAudit, json } from '@/lib/api';
import { setArsiv } from '@/lib/is-takip';

// WWS işini arşive çekmek / geri almak.
//
// Yalnız owner. WWS alanının kuralı bu (bkz. AREAS): admin bile göremiyor,
// dolayısıyla değiştiremez de. `setArsiv` içindeki owner kontrolü asıl sınır;
// buradaki 403 sadece daha temiz bir cevap veriyor.
export async function POST(request) {
  const actor = await getActor();
  if (!actor) return json({ error: 'Nicht angemeldet.' }, 401);
  if (!actor.is_owner) return json({ error: 'Kein Zugriff.' }, 403);

  const body = await request.json().catch(() => ({}));
  const isId = typeof body.id === 'string' ? body.id : null;
  if (!isId) return json({ error: 'İş kimliği eksik.' }, 400);
  const arsiv = body.arsiv !== false;

  try {
    const sonuc = await setArsiv(actor, isId, arsiv);
    if (!sonuc) return json({ error: 'İş bulunamadı.' }, 404);

    await writeAudit(serviceClient(), actor.id,
      arsiv ? 'is_arsivlendi' : 'is_arsivden_cikarildi', 'is_isler', isId, null);

    return json({ ok: true, arsiv: sonuc.arsiv });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
}
