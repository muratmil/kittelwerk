import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role, workshop_id').eq('id', user.id).single();

  const isMerkez = profile?.role === 'seller' && !profile?.workshop_id;
  const isAdmin = profile?.role === 'admin';
  if (!isMerkez && !isAdmin) {
    return Response.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  const { workshop_id } = await req.json();
  if (!workshop_id) return Response.json({ error: 'workshop_id fehlt.' }, { status: 400 });

  const { data: workshop, error } = await supabaseAdmin
    .from('workshops')
    .update({ active: true })
    .eq('id', workshop_id)
    .select().single();

  if (error) return Response.json({ error: 'Fehler beim Aktivieren.' }, { status: 500 });

  await resend.emails.send({
    from: 'Kittelwerk <info@kittelwerk.de>',
    to: workshop.email,
    subject: 'Ihr Atölye-Zugang wurde freigeschaltet — Kittelwerk',
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px"><span style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:22px;color:#fff;text-transform:uppercase">Kittel<span style="color:#E63946">werk</span>.</span></div>
      <div style="padding:32px;border:3px solid #111;border-top:none">
        <h2 style="margin:0 0 8px;font-size:18px;text-transform:uppercase">Zugang freigeschaltet!</h2>
        <p style="margin-bottom:20px">Ihr Atölye-Konto <strong>${workshop.name}</strong> wurde freigeschaltet. Sie können sich jetzt anmelden.</p>
        <a href="https://kittelwerk.de/atolye/login" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:.1em;padding:14px 28px">Zum Atölye-Portal →</a>
      </div>
    </div>`,
  }).catch(() => {});

  return Response.json({ success: true, workshop });
}
