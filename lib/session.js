import { createClient } from '@/utils/supabase/server';

// Sunucu tarafında oturum sahibinin profili. Sayfalar bunu okuyup kabuğa verir.
export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, is_owner, permissions, werkstatt_id, company')
    .eq('id', user.id)
    .single();

  if (!data) return null;
  return { ...data, email: data.email ?? user.email };
}
