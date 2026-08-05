import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadCatalog } from '@/lib/catalog';
import { hasPermission } from '@/lib/portal';
import PortalShell from '@/components/portal/PortalShell';
import AdminClient from './AdminClient';

export const metadata = {
  title: 'Verwaltung — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const darfPreise = hasPermission(profile, 'preise_pflegen') || hasPermission(profile, 'preise_sehen');

  // Fiyat sekmesi yalnızca yetkiliye yükleniyor — yetkisi olmayan için veri
  // hiç sunucudan çıkmıyor, arayüzde gizlemeye gerek kalmıyor.
  const catalog = darfPreise
    ? await loadCatalog(supabase, { includeInactive: true })
    : { products: [], settings: {}, marginDefaults: [], rateByCurrency: {} };

  const { data: rates } = darfPreise
    ? await supabase.from('exchange_rates')
        .select('id, currency, rate, valid_from').order('valid_from', { ascending: false }).limit(20)
    : { data: [] };

  return (
    <PortalShell profile={profile} current="/admin" title="Verwaltung">
      <AdminClient
        profile={profile}
        catalog={{ ...catalog, rates: rates ?? [] }}
      />
    </PortalShell>
  );
}
