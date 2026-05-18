import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  let targetEmail;
  let targetName;

  if (workshop_id) {
    const { data: workshop } = await supabaseAdmin
      .from('workshops').select('id, name, email').eq('id', workshop_id).single();
    if (!workshop) return Response.json({ error: 'Atölye nicht gefunden.' }, { status: 404 });
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles').select('id').eq('workshop_id', workshop_id).single();
    userId = targetProfile?.id;
    targetEmail = workshop.email;
    targetName = workshop.name;
  } else {
    const { data: reseller } = await supabaseAdmin
      .from('resellers').select('profile_id, email, contact_name').eq('id', reseller_id).single();
    if (!reseller) return Response.json({ error: 'Händler nicht gefunden.' }, { status: 404 });
    userId = reseller.profile_id;
    targetEmail = reseller.email;
    targetName = reseller.contact_name;
  }

  if (!userId) return Response.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });

  const newPassword = require('crypto').randomBytes(12).toString('base64url');

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return Response.json({ error: 'Fehler beim Zurücksetzen.' }, { status: 500 });

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: targetEmail,
    subject: 'Ihr Passwort wurde zurückgesetzt — Kittelwerk',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
        <h2 style="margin-top:16px;">Passwort zurückgesetzt</h2>
        <p>Guten Tag ${targetName},</p>
        <p style="margin-top:12px;">Ihr Passwort wurde vom Administrator zurückgesetzt. Hier sind Ihre neuen Zugangsdaten:</p>
        <div style="background:#f5f0e8;border:2px solid #111;padding:20px;margin:24px 0;">
          <p style="font-weight:900;font-size:13px;text-transform:uppercase;margin:0 0 12px;">Neues Passwort</p>
          <p style="margin:4px 0;font-size:14px;">📧 <strong>${targetEmail}</strong></p>
          <p style="margin:4px 0;font-size:14px;">🔑 <strong style="font-family:monospace;background:#fff;padding:2px 8px;">${newPassword}</strong></p>
        </div>
        <p style="color:#E63946;font-size:12px;font-weight:bold;">Bitte ändern Sie Ihr Passwort nach dem nächsten Login.</p>
        <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
        <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
      </div>
    `,
  }).catch(() => {});

  return Response.json({ success: true });
}
