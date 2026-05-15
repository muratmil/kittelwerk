import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (callerProfile?.role !== 'admin') return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { workshop_id, reseller_id } = await req.json();
  if (!workshop_id && !reseller_id) return Response.json({ error: 'ID fehlt.' }, { status: 400 });

  let userId;

  if (workshop_id) {
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles').select('id').eq('workshop_id', workshop_id).single();
    userId = targetProfile?.id;
  } else {
    const { data: reseller } = await supabaseAdmin
      .from('resellers').select('profile_id').eq('id', reseller_id).single();
    userId = reseller?.profile_id;
  }

  if (!userId) return Response.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });

  const newPassword = `Kw${Math.floor(10000 + Math.random() * 90000)}!`;

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return Response.json({ error: 'Fehler beim Zurücksetzen.' }, { status: 500 });

  return Response.json({ success: true, newPassword });
}
