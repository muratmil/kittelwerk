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

  const { reseller_id, action, discount_rate } = await req.json();
  if (!reseller_id) return Response.json({ error: 'reseller_id fehlt.' }, { status: 400 });

  const { data: reseller } = await supabaseAdmin
    .from('resellers').select('*').eq('id', reseller_id).single();
  if (!reseller) return Response.json({ error: 'Händler nicht gefunden.' }, { status: 404 });

  if (action === 'reject') {
    await supabaseAdmin.from('resellers').delete().eq('id', reseller_id);
    if (reseller.profile_id) {
      await supabaseAdmin.auth.admin.deleteUser(reseller.profile_id);
    }
    await resend.emails.send({
      from: 'Kittelwerk <info@kittelwerk.de>',
      to: reseller.email,
      subject: 'Ihre Händleranfrage bei Kittelwerk',
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
        <div style="padding:32px;border:3px solid #111;border-top:none">
          <h2 style="margin:0 0 8px;font-size:16px;text-transform:uppercase">Ihre Händleranfrage</h2>
          <p>Sehr geehrte/r ${reseller.contact_name}, leider können wir Ihrer Anfrage für <strong>${reseller.company}</strong> zum aktuellen Zeitpunkt nicht entsprechen.</p>
          <p style="margin-top:12px;font-size:12px;opacity:.6">Bei Fragen: <a href="mailto:info@kittelwerk.de">info@kittelwerk.de</a></p>
        </div>
      </div>`,
    }).catch(() => {});
    return Response.json({ success: true, action: 'rejected' });
  }

  const rate = parseFloat(discount_rate) || 15;

  const { error } = await supabaseAdmin
    .from('resellers')
    .update({ active: true, discount_rate: rate })
    .eq('id', reseller_id);

  if (error) return Response.json({ error: 'Fehler beim Aktivieren.' }, { status: 500 });

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: reseller.email,
    subject: 'Ihr Händlerkonto wurde freigeschaltet — Kittelwerk',
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
      <div style="padding:32px;border:3px solid #111;border-top:none">
        <h2 style="margin:0 0 8px;font-size:18px;text-transform:uppercase">Zugang freigeschaltet!</h2>
        <p>Ihr Händlerkonto <strong>${reseller.company}</strong> wurde freigeschaltet. Sie können sich jetzt anmelden.</p>
        <p style="margin-top:12px;opacity:.7">Ihr Händlerrabatt beträgt <strong>${rate}%</strong> auf alle Produkte.</p>
        <a href="https://kittelwerk.de/reseller/login" style="display:inline-block;margin-top:20px;background:#111;color:#fff;text-decoration:none;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:.1em;padding:14px 28px">Zum Händlerportal →</a>
      </div>
    </div>`,
  }).catch(() => {});

  return Response.json({ success: true, action: 'approved' });
}
