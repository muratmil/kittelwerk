import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { company, contact_name, email, phone, discount_rate } = await req.json();
  if (!company || !contact_name || !email) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  // Supabase Admin API ile auth kullanıcısı oluştur
  const tempPassword = `Haendler${Math.floor(1000 + Math.random() * 9000)}!`;

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

  // Rol güncelle
  await supabaseAdmin.from('profiles').update({ role: 'reseller' }).eq('id', authUser.id);

  // Reseller kaydı oluştur
  const { error: resellerError } = await supabaseAdmin.from('resellers').insert([{
    profile_id: authUser.id,
    company, contact_name, email,
    phone: phone || null,
    discount_rate: parseFloat(discount_rate) || 15,
  }]);

  if (resellerError) {
    return Response.json({ error: 'Händlerdaten konnten nicht gespeichert werden.' }, { status: 500 });
  }

  return Response.json({ success: true, tempPassword });
}
