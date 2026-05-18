import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { company, contact_name, email, phone, discount_rate, steuer_id, gewerbe_info } = await req.json();
  if (!company || !contact_name || !email) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  // Supabase Admin API ile auth kullanıcısı oluştur
  const tempPassword = require('crypto').randomBytes(12).toString('base64url');

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
    steuer_id: steuer_id || null,
    gewerbe_info: gewerbe_info || null,
    discount_rate: parseFloat(discount_rate) || 15,
  }]);

  if (resellerError) {
    return Response.json({ error: 'Händlerdaten konnten nicht gespeichert werden.' }, { status: 500 });
  }

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: email,
    subject: 'Ihr Händlerkonto bei Kittelwerk — Zugangsdaten',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
        <h2 style="margin-top:16px;">Willkommen als Händler!</h2>
        <p>Sehr geehrte/r ${contact_name},</p>
        <p style="margin-top:12px;">Ihr Händlerkonto wurde eingerichtet. Hier sind Ihre Zugangsdaten:</p>
        <div style="background:#f5f0e8;border:2px solid #111;padding:20px;margin:24px 0;">
          <p style="font-weight:900;font-size:13px;text-transform:uppercase;margin:0 0 12px;">Ihre Zugangsdaten</p>
          <p style="margin:4px 0;font-size:14px;">🌐 <a href="https://kittelwerk.de/reseller/login" style="color:#E63946;font-weight:bold;">kittelwerk.de/reseller/login</a></p>
          <p style="margin:4px 0;font-size:14px;">📧 <strong>${email}</strong></p>
          <p style="margin:4px 0;font-size:14px;">🔑 <strong style="font-family:monospace;background:#fff;padding:2px 8px;">${tempPassword}</strong></p>
        </div>
        <p style="color:#E63946;font-size:12px;font-weight:bold;">Bitte ändern Sie Ihr Passwort nach dem ersten Login.</p>
        <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
        <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
      </div>
    `,
  }).catch(() => {});

  return Response.json({ success: true });
}

export async function PATCH(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { id, discount_rate, steuer_id, gewerbe_info } = await req.json();
  if (!id) return Response.json({ error: 'ID fehlt.' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('resellers')
    .update({ discount_rate: parseFloat(discount_rate) || 15, steuer_id: steuer_id ?? undefined, gewerbe_info: gewerbe_info ?? undefined })
    .eq('id', id);

  if (error) return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  return Response.json({ success: true });
}
