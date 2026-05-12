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

  const { applicationId, action, discount_rate } = await req.json();

  const { data: application } = await supabaseAdmin
    .from('reseller_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (!application) return Response.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 });

  if (action === 'reject') {
    await supabaseAdmin
      .from('reseller_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: application.email,
      subject: 'Ihre Händleranfrage bei Kittelwerk',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:24px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
          <h2 style="margin-top:16px;">Ihre Händleranfrage</h2>
          <p>Sehr geehrte/r ${application.contact_name},</p>
          <p style="margin-top:12px;">Wir haben Ihre Händleranfrage für <strong>${application.company}</strong> geprüft und können Ihnen leider mitteilen, dass wir Ihrer Anfrage zum aktuellen Zeitpunkt nicht entsprechen können.</p>
          <p style="margin-top:12px;">Bei Fragen stehen wir Ihnen gerne unter <a href="mailto:info@kittelwerk.de">info@kittelwerk.de</a> zur Verfügung.</p>
          <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
          <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
        </div>
      `,
    });

    return Response.json({ success: true, action: 'rejected' });
  }

  if (action === 'approve') {
    const tempPassword = `Haendler${Math.floor(1000 + Math.random() * 9000)}!`;

    // Auth kullanıcısı oluştur
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ email: application.email, password: tempPassword, email_confirm: true }),
    });

    if (!res.ok) {
      const err = await res.json();
      return Response.json({ error: err.msg || 'Fehler beim Erstellen des Accounts.' }, { status: 500 });
    }

    const authUser = await res.json();

    await supabaseAdmin.from('profiles').update({ role: 'reseller' }).eq('id', authUser.id);

    await supabaseAdmin.from('resellers').insert([{
      profile_id: authUser.id,
      company: application.company,
      contact_name: application.contact_name,
      email: application.email,
      phone: application.phone,
      discount_rate: parseFloat(discount_rate) || 15,
    }]);

    await supabaseAdmin
      .from('reseller_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    // Genehmigungsmail mit Zugangsdaten
    await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: application.email,
      subject: '✅ Ihr Händlerkonto bei Kittelwerk ist aktiviert',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h1 style="font-size:24px;font-weight:900;">Kittel<span style="color:#E63946">werk</span>.</h1>
          <h2 style="margin-top:16px;">Willkommen als Händler!</h2>
          <p>Sehr geehrte/r ${application.contact_name},</p>
          <p style="margin-top:12px;">Ihre Händleranfrage für <strong>${application.company}</strong> wurde genehmigt. Ab sofort können Sie über unser Händlerportal Bestellungen aufgeben.</p>
          <div style="background:#f5f0e8;border:2px solid #111;padding:20px;margin:24px 0;">
            <p style="font-weight:900;font-size:13px;text-transform:uppercase;margin:0 0 12px;">Ihre Zugangsdaten</p>
            <p style="margin:4px 0;font-size:14px;">🌐 <a href="https://kittelwerk.de/reseller/login" style="color:#E63946;font-weight:bold;">kittelwerk.de/reseller/login</a></p>
            <p style="margin:4px 0;font-size:14px;">📧 <strong>${application.email}</strong></p>
            <p style="margin:4px 0;font-size:14px;">🔑 <strong style="font-family:monospace;background:#fff;padding:2px 8px;">${tempPassword}</strong></p>
          </div>
          <p style="color:#E63946;font-size:12px;font-weight:bold;">Bitte ändern Sie Ihr Passwort nach dem ersten Login.</p>
          <p style="margin-top:16px;color:#555;">Ihr Händlerrabatt beträgt <strong>${discount_rate || 15}%</strong> auf alle Produkte.</p>
          <hr style="margin:32px 0;border:none;border-top:2px solid #111;"/>
          <p style="color:#999;font-size:11px;">© 2026 Kittelwerk · info@kittelwerk.de</p>
        </div>
      `,
    });

    return Response.json({ success: true, action: 'approved' });
  }

  return Response.json({ error: 'Ungültige Aktion.' }, { status: 400 });
}
