import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Siparişe atölye atama.
// orders tablosuna UPDATE yetkisi hiçbir role verilmedi (bkz. migration), bu
// yüzden yazma işi burada service key ile yapılıyor — ama önce çağıranın
// gerçekten yetkili olduğu doğrulanıyor.
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role, is_owner, permissions').eq('id', user.id).single();

  const allowed =
    profile?.is_owner ||
    profile?.role === 'vertrieb' ||
    (profile?.role === 'admin' && (profile.permissions ?? []).includes('werkstatt_zuweisen'));

  if (!allowed) return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { order_id, werkstatt_id } = await request.json().catch(() => ({}));
  if (!order_id || !werkstatt_id) {
    return Response.json({ error: 'Auftrag und Werkstatt sind erforderlich.' }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: shop } = await admin
    .from('werkstaetten').select('id, active').eq('id', werkstatt_id).single();
  if (!shop?.active) {
    return Response.json({ error: 'Werkstatt nicht gefunden oder inaktiv.' }, { status: 400 });
  }

  const { data: before } = await admin
    .from('orders').select('werkstatt_id, status').eq('id', order_id).single();
  if (!before) return Response.json({ error: 'Auftrag nicht gefunden.' }, { status: 404 });

  const { error } = await admin
    .from('orders')
    .update({
      werkstatt_id,
      // İlk atamada iş üretime girer; yeniden yönlendirmede durum korunur.
      status: before.werkstatt_id ? before.status : 'in_produktion',
    })
    .eq('id', order_id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: before.werkstatt_id ? 'auftrag_umgeleitet' : 'auftrag_zugewiesen',
    target_type: 'order',
    target_id: order_id,
    detail: { von: before.werkstatt_id, nach: werkstatt_id },
  });

  return Response.json({ ok: true });
}
