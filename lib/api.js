import { randomBytes } from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Yazma işleri service key ile yapılıyor (profiles/orders'a doğrudan yazma
// yetkisi hiçbir role verilmedi), ama önce çağıranın kim olduğu doğrulanıyor.
export function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );
}

/** Oturumdaki kişinin profili — yetki kararları buna göre veriliyor. */
export async function getActor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, is_owner, permissions, werkstatt_id')
    .eq('id', user.id)
    .single();

  return data ?? null;
}

/** Hedef kullanıcının profili — service key ile, RLS'ten bağımsız. */
export async function getTarget(svc, id) {
  const { data } = await svc
    .from('profiles')
    .select('id, email, role, is_owner, permissions, created_by, werkstatt_id')
    .eq('id', id)
    .single();
  return data ?? null;
}

/** Karışması kolay harfler çıkarıldı; ekrandan okunup elle yazılacak. */
export function generatePassword(length = 16) {
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function writeAudit(svc, actorId, action, targetType, targetId, detail) {
  await svc.from('audit_log').insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId ? String(targetId) : null,
    detail: detail ?? null,
  });
}

export const json = (body, status = 200) => Response.json(body, { status });
