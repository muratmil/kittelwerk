import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { esc } from '@/lib/escapeHtml';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 3, windowMs: 60 * 60_000 });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { name, contact_name, email, phone, password } = await req.json();

  if (!name || !email || !password) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('workshops').select('id').eq('email', email).single();
  if (existing) {
    return Response.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    const msg = authError.message?.includes('already registered')
      ? 'Diese E-Mail-Adresse ist bereits registriert.'
      : 'Fehler beim Erstellen des Kontos.';
    return Response.json({ error: msg }, { status: 400 });
  }

  const { data: workshop, error: wError } = await supabaseAdmin
    .from('workshops')
    .insert([{ name, contact_name: contact_name || null, email, phone: phone || null, active: false }])
    .select().single();

  if (wError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return Response.json({ error: 'Fehler beim Speichern der Werkstattdaten.' }, { status: 500 });
  }

  await supabaseAdmin
    .from('profiles')
    .update({ role: 'seller', workshop_id: workshop.id })
    .eq('id', authData.user.id);

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: 'atolye@kittelwerk.de',
    subject: `Neue Atölye-Anfrage: ${esc(name)}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
      <div style="padding:32px;border:3px solid #111;border-top:none">
        <h2 style="margin:0 0 16px;font-size:18px;text-transform:uppercase">Neue Atölye-Anfrage</h2>
        <p><strong>Atölye:</strong> ${esc(name)}</p>
        <p><strong>Kontakt:</strong> ${esc(contact_name) || '—'}</p>
        <p><strong>E-Mail:</strong> ${esc(email)}</p>
        ${phone ? `<p><strong>Tel:</strong> ${esc(phone)}</p>` : ''}
        <p style="margin-top:24px">Bitte die Anfrage im Atölye-Merkez-Portal genehmigen.</p>
        <a href="https://kittelwerk.de/atolye" style="display:inline-block;margin-top:12px;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-weight:900;text-transform:uppercase;font-size:11px;letter-spacing:.1em">Zum Portal →</a>
      </div>
    </div>`,
  }).catch(() => {});

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: email,
    subject: 'Ihre Atölye-Anfrage bei Kittelwerk',
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
      <div style="padding:32px;border:3px solid #111;border-top:none">
        <h2 style="margin:0 0 8px;font-size:18px;text-transform:uppercase">Danke, ${esc(contact_name || name)}!</h2>
        <p style="margin-bottom:16px;opacity:.6;font-size:13px">Ihre Anfrage wurde erhalten.</p>
        <p>Wir prüfen Ihre Anfrage und schalten Ihren Zugang so bald wie möglich frei.</p>
        <p style="margin-top:12px;color:#555;font-size:13px">Nach der Freischaltung können Sie sich unter <a href="https://kittelwerk.de/atolye/login">kittelwerk.de/atolye/login</a> anmelden.</p>
      </div>
    </div>`,
  }).catch(() => {});

  return Response.json({ success: true });
}
