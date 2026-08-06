import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadCatalog } from '@/lib/catalog';
import { loadSites, visibleSites, pickSite } from '@/lib/sites';
import { hasPermission } from '@/lib/portal';
import PortalShell from '@/components/portal/PortalShell';
import AdminClient from './AdminClient';

export const metadata = {
  title: 'Verwaltung — Central Communication Hub (CCH)',
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const sp = await searchParams;
  const alleSites = visibleSites(await loadSites(supabase), profile);
  const siteId = pickSite(alleSites, profile, sp?.site);
  const darfPreise = hasPermission(profile, 'preise_pflegen') || hasPermission(profile, 'preise_sehen');

  // Fiyat sekmesi yalnızca yetkiliye yükleniyor — yetkisi olmayan için veri
  // hiç sunucudan çıkmıyor, arayüzde gizlemeye gerek kalmıyor.
  const catalog = darfPreise
    ? await loadCatalog(supabase, { includeInactive: true, siteId })
    : { products: [], settings: {}, marginDefaults: [], rateByCurrency: {} };

  const { data: rates } = darfPreise
    ? await supabase.from('exchange_rates')
        .select('id, currency, rate, valid_from').order('valid_from', { ascending: false }).limit(20)
    : { data: [] };

  return (
    <PortalShell profile={profile} current="/admin" title="Verwaltung"
      sites={alleSites} activeSite={siteId}>
      <AdminClient
        profile={profile}
        sites={alleSites}
        activeSite={siteId}
        catalog={{ ...catalog, rates: rates ?? [] }}
      />
    </PortalShell>
  );
}
