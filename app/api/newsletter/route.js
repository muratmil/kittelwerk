import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { woerterbuch } from '@/lib/i18n';
import { istSprache } from '@/lib/i18n/config';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 3, windowMs: 60 * 60_000 });
  if (!allowed) return rateLimitResponse(retryAfter);

  const body = await req.json();
  const { email } = body;
  // Kod e-postası ziyaretçinin dilinde (2026-09-29).
  const M = woerterbuch(istSprache(body.lang) ? body.lang : 'de').mail;
  const N = M.newsletter;

  if (!email || String(email).length > 254 || !EMAIL_RE.test(String(email))) {
    return Response.json({ error: M.fehler.email }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .insert([{ email }]);

  if (error) {
    if (error.code === '23505') {
      return Response.json({ error: M.fehler.bereits }, { status: 409 });
    }
    return Response.json({ error: M.fehler.allgemein }, { status: 500 });
  }

  let resendResult;
  try {
    resendResult = await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: email,
      subject: N.betreff,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 8px;">Kittel<span style="color:#E63946">werk</span>.</h1>
          <h2 style="font-size: 20px; margin-top: 24px;">${N.danke}</h2>
          <p style="color: #555;">${N.text1}<strong>${N.textStark}</strong>${N.text2}</p>
          <div style="background:#111; color:#F5B800; font-size:28px; font-weight:900; letter-spacing:4px; padding:20px; text-align:center; margin:24px 0;">
            KITTEL10
          </div>
          <p style="color: #555; font-size: 13px;">${N.hinweis}<a href="https://kittelwerk.de">kittelwerk.de</a>.</p>
          <hr style="margin: 32px 0; border: none; border-top: 2px solid #111;" />
          <p style="color: #999; font-size: 11px;">${N.rechte}</p>
        </div>
      `,
    });
  } catch (e) {
    return Response.json({ error: M.fehler.senden }, { status: 500 });
  }

  if (resendResult?.error) {
    return Response.json({ error: M.fehler.senden }, { status: 500 });
  }

  return Response.json({ success: true });
}
