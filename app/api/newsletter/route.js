import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 3, windowMs: 60 * 60_000 });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { email } = await req.json();

  if (!email || String(email).length > 254 || !EMAIL_RE.test(String(email))) {
    return Response.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .insert([{ email }]);

  if (error) {
    if (error.code === '23505') {
      return Response.json({ error: 'Diese E-Mail ist bereits registriert.' }, { status: 409 });
    }
    return Response.json({ error: 'Ein Fehler ist aufgetreten.' }, { status: 500 });
  }

  let resendResult;
  try {
    resendResult = await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: email,
      subject: '🎉 Dein Rabattcode: KITTEL10',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 8px;">Kittel<span style="color:#E63946">werk</span>.</h1>
          <h2 style="font-size: 20px; margin-top: 24px;">Vielen Dank für deine Anmeldung!</h2>
          <p style="color: #555;">Hier ist dein persönlicher Rabattcode für <strong>5% Rabatt</strong> auf deine erste Bestellung:</p>
          <div style="background:#111; color:#F5B800; font-size:28px; font-weight:900; letter-spacing:4px; padding:20px; text-align:center; margin:24px 0;">
            KITTEL10
          </div>
          <p style="color: #555; font-size: 13px;">Gib den Code im Warenkorb ein. Gültig für alle Produkte auf <a href="https://kittelwerk.de">kittelwerk.de</a>.</p>
          <hr style="margin: 32px 0; border: none; border-top: 2px solid #111;" />
          <p style="color: #999; font-size: 11px;">© 2026 Kittelwerk. Alle Rechte vorbehalten.</p>
        </div>
      `,
    });
  } catch (e) {
    return Response.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 500 });
  }

  if (resendResult?.error) {
    return Response.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 500 });
  }

  return Response.json({ success: true });
}
