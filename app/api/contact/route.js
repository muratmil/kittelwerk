import { Resend } from 'resend';
import { esc } from '@/lib/escapeHtml';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 5, windowMs: 60 * 60_000 });
  if (!allowed) return rateLimitResponse(retryAfter);

  const { name, email, company, subject, message } = await req.json();

  if (!name || !email || !message) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  let result;
  try {
    result = await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: 'info@kittelwerk.de',
      replyTo: email,
      subject: `[Kontakt] ${esc(name)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:24px;">Neue Kontaktanfrage</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px;color:#555;width:120px;">Name</td><td><strong>${esc(name)}</strong></td></tr>
            <tr><td style="padding:6px;color:#555;">E-Mail</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            ${company ? `<tr><td style="padding:6px;color:#555;">Restaurant</td><td><strong>${esc(company)}</strong></td></tr>` : ''}
            ${subject ? `<tr><td style="padding:6px;color:#555;">Thema</td><td><strong>${esc(subject)}</strong></td></tr>` : ''}
          </table>
          <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-left:4px solid #111;">
            <p style="white-space:pre-wrap;margin:0;">${esc(message)}</p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    return Response.json({ error: 'Fehler beim Senden.' }, { status: 500 });
  }

  if (result?.error) {
    return Response.json({ error: 'Fehler beim Senden.' }, { status: 500 });
  }

  return Response.json({ success: true });
}
