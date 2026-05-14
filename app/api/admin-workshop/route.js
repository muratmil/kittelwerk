import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { name, contact_name, email, phone } = await req.json();
  if (!name || !email) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const tempPassword = `Atolye${Math.floor(1000 + Math.random() * 9000)}!`;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ email, password: tempPassword, email_confirm: true }),
  });

  if (!res.ok) {
    const err = await res.json();
    return Response.json({ error: err.msg || 'Fehler beim Erstellen des Benutzers.' }, { status: 500 });
  }

  const authUser = await res.json();

  const { data: workshop, error: wError } = await supabaseAdmin
    .from('workshops')
    .insert([{ name, contact_name: contact_name || null, email, phone: phone || null }])
    .select()
    .single();

  if (wError) {
    return Response.json({ error: 'Werkstattdaten konnten nicht gespeichert werden.' }, { status: 500 });
  }

  await supabaseAdmin
    .from('profiles')
    .update({ role: 'seller', workshop_id: workshop.id })
    .eq('id', authUser.id);

  return Response.json({ success: true, tempPassword });
}
