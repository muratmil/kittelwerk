import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { company, contact_name, email, phone, street, plz, city, steuer_id, gewerbe_info, message } = await req.json();

  if (!company || !contact_name || !email || !steuer_id) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  // E-posta daha önce başvurmuş mu kontrol et
  const { data: existing } = await supabaseAdmin
    .from('reseller_applications')
    .select('id, status')
    .eq('email', email)
    .single();

  if (existing) {
    if (existing.status === 'pending') {
      return Response.json({ error: 'Eine Anfrage mit dieser E-Mail-Adresse ist bereits in Bearbeitung.' }, { status: 400 });
    }
    if (existing.status === 'approved') {
      return Response.json({ error: 'Diese E-Mail-Adresse ist bereits als Händler registriert.' }, { status: 400 });
    }
  }

  const { error } = await supabaseAdmin.from('reseller_applications').insert([{
    company, contact_name, email,
    phone: phone || null,
    street: street || null,
    plz: plz || null,
    city: city || null,
    steuer_id,
    gewerbe_info: gewerbe_info || null,
    message: message || null,
    status: 'pending',
  }]);

  if (error) {
    return Response.json({ error: 'Fehler beim Speichern der Anfrage.' }, { status: 500 });
  }

  // Admin bildirimi
  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `🏪 Neue Händleranfrage: ${company}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
        <h2 style="margin-top:16px;">Neue Händleranfrage</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:6px;color:#555;width:160px;">Firma</td><td><strong>${company}</strong></td></tr>
          <tr><td style="padding:6px;color:#555;">Ansprechpartner</td><td>${contact_name}</td></tr>
          <tr><td style="padding:6px;color:#555;">E-Mail</td><td><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:6px;color:#555;">Telefon</td><td>${phone}</td></tr>` : ''}
          ${street ? `<tr><td style="padding:6px;color:#555;">Adresse</td><td>${street}, ${plz} ${city}</td></tr>` : ''}
          <tr><td style="padding:6px;color:#555;">Steuernummer</td><td><strong>${steuer_id}</strong></td></tr>
          ${gewerbe_info ? `<tr><td style="padding:6px;color:#555;">Gewerbe</td><td>${gewerbe_info}</td></tr>` : ''}
          ${message ? `<tr><td style="padding:6px;color:#555;">Nachricht</td><td><em>${message}</em></td></tr>` : ''}
        </table>
        <p style="margin-top:24px;color:#555;font-size:13px;">
          Anfrage im Backend prüfen und genehmigen oder ablehnen.
        </p>
        <hr style="margin:24px 0;border:none;border-top:2px solid #111;"/>
        <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
      </div>
    `,
  });

  // Başvuru sahibine onay maili
  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: email,
    subject: 'Ihre Händleranfrage bei Kittelwerk',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:24px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
        <h2 style="margin-top:16px;">Danke, ${contact_name}!</h2>
        <p>Wir haben Ihre Händleranfrage für <strong>${company}</strong> erhalten und prüfen Ihre Angaben.</p>
        <p style="margin-top:12px;">In der Regel melden wir uns <strong>innerhalb von 1–2 Werktagen</strong> per E-Mail bei Ihnen.</p>
        <p style="margin-top:12px;color:#555;">Bei Fragen erreichen Sie uns unter <a href="mailto:info@kittelwerk.de">info@kittelwerk.de</a>.</p>
        <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
        <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
      </div>
    `,
  });

  return Response.json({ success: true });
}
