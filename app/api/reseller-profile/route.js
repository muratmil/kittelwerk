import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

// Händler darf NUR diese Felder selbst ändern.
// steuer_id, discount_rate, company, email, active bleiben ausschließlich Admin-Sache.
const EDITABLE_FIELDS = ['contact_name', 'phone', 'street', 'plz', 'city'];
const MAX_LEN = 200;

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Nicht autorisiert.' }, { status: 401 });

  // Aktives Händlerkonto prüfen
  const { data: reseller } = await supabaseAdmin
    .from('resellers')
    .select('id, active')
    .eq('profile_id', user.id)
    .single();

  if (!reseller || !reseller.active) {
    return Response.json({ error: 'Kein aktives Händlerkonto gefunden.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  // Nur erlaubte Felder übernehmen (Whitelist) — steuer_id & discount_rate niemals.
  const update = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] === undefined || body[key] === null) continue;
    const val = String(body[key]).trim().slice(0, MAX_LEN);
    update[key] = val === '' ? null : val;
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'Keine änderbaren Felder übergeben.' }, { status: 400 });
  }

  const { data: updated, error } = await supabaseAdmin
    .from('resellers')
    .update(update)
    .eq('id', reseller.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }

  return Response.json({ success: true, reseller: updated });
}
