import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { esc } from '@/lib/escapeHtml';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 3, windowMs: 60 * 60_000 });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { company, contact_name, email, phone, password, steuer_id, gewerbe_info } = await req.json();

  if (!company || !contact_name || !email || !password || !steuer_id) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    const msg = authError.message || '';
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return Response.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 400 });
    }
    return Response.json({ error: 'Fehler beim Erstellen des Accounts.' }, { status: 500 });
  }

  const { error: resellerError } = await supabaseAdmin.from('resellers').insert([{
    profile_id: authData.user.id,
    company,
    contact_name,
    email,
    phone: phone || null,
    steuer_id,
    gewerbe_info: gewerbe_info || null,
    discount_rate: 15,
    active: false,
  }]);

  if (resellerError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return Response.json({ error: 'Fehler beim Speichern der Registrierung.' }, { status: 500 });
  }

  await supabaseAdmin.from('profiles').update({ role: 'reseller' }).eq('id', authData.user.id);

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Neue Händleranfrage: ${esc(company)}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
      <div style="padding:32px;border:3px solid #111;border-top:none">
        <h2 style="margin:0 0 16px;font-size:16px;text-transform:uppercase">Neue Händleranfrage</h2>
        <p><strong>${esc(company)}</strong> — ${esc(contact_name)}</p>
        <p>${esc(email)}${phone ? ' · ' + esc(phone) : ''}</p>
        <p>Steuer-ID: <strong>${esc(steuer_id)}</strong></p>
        ${gewerbe_info ? `<p>Gewerbe: ${esc(gewerbe_info)}</p>` : ''}
        <p style="margin-top:16px;font-size:12px;opacity:.6">Im Backend unter "Händler" prüfen und freischalten.</p>
      </div>
    </div>`,
  }).catch(() => {});

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: email,
    subject: 'Ihre Händleranfrage — Kittelwerk',
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
      <div style="padding:32px;border:3px solid #111;border-top:none">
        <h2 style="margin:0 0 8px;font-size:18px;text-transform:uppercase">Anfrage eingegangen!</h2>
        <p>Vielen Dank, <strong>${esc(contact_name)}</strong>. Ihre Händleranfrage für <strong>${esc(company)}</strong> wird geprüft.</p>
        <p style="margin-top:12px;opacity:.6;font-size:13px">In der Regel melden wir uns innerhalb von 1–2 Werktagen per E-Mail bei Ihnen.</p>
      </div>
    </div>`,
  }).catch(() => {});

  return Response.json({ success: true });
}
