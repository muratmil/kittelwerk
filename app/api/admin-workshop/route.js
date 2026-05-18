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

  const { name, contact_name, email, phone } = await req.json();
  if (!name || !email) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

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

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: email,
    subject: 'Ihr Atölye-Zugang — Kittelwerk',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <div style="background:#111;padding:24px 32px">
          <span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase;letter-spacing:1px">
            Kittel<span style="color:#E63946">werk</span>.
          </span>
        </div>
        <div style="padding:32px;border:3px solid #111;border-top:none">
          <h2 style="margin:0 0 8px;font-size:18px;text-transform:uppercase;letter-spacing:1px">Willkommen, ${contact_name || name}!</h2>
          <p style="margin:0 0 24px;opacity:.6;font-size:13px">Ihr Atölye-Zugang wurde eingerichtet.</p>

          <div style="background:#f5f0e8;border:2px solid #111;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 6px;font-size:10px;font-weight:900;text-transform:uppercase;opacity:.5;letter-spacing:.08em">Werkstatt</p>
            <p style="margin:0 0 16px;font-weight:900;font-size:15px">${name}</p>
            <p style="margin:0 0 6px;font-size:10px;font-weight:900;text-transform:uppercase;opacity:.5;letter-spacing:.08em">Login (E-Mail)</p>
            <p style="margin:0 0 16px;font-weight:700;font-size:14px">${email}</p>
            <p style="margin:0 0 6px;font-size:10px;font-weight:900;text-transform:uppercase;opacity:.5;letter-spacing:.08em">Passwort</p>
            <p style="margin:0;font-family:monospace;font-size:16px;font-weight:900;background:#fff;display:inline-block;padding:6px 12px;border:2px solid #111">${tempPassword}</p>
          </div>

          <a href="https://kittelwerk.de/atolye/login"
            style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:.1em;padding:14px 28px;border:2px solid #111">
            Zum Atölye-Portal →
          </a>

          <p style="margin:24px 0 0;font-size:11px;opacity:.4">Bitte ändern Sie Ihr Passwort nach dem ersten Login.</p>
        </div>
      </div>
    `,
  });

  return Response.json({ success: true });
}

export async function PATCH(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { id, name, contact_name, phone, active } = await req.json();
  if (!id || !name) return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });

  const { error: wError } = await supabaseAdmin
    .from('workshops')
    .update({ name, contact_name: contact_name || null, phone: phone || null, active: active !== false })
    .eq('id', id);

  if (wError) return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });

  return Response.json({ success: true });
}
