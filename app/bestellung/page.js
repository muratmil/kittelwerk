import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadSites, visibleSites, pickSite } from '@/lib/sites';
import PortalShell from '@/components/portal/PortalShell';
import BestellungClient from './BestellungClient';

export const metadata = {
  title: 'Bestellungen — Central Communication Hub (CCH)',
  robots: { index: false, follow: false },
};

export default async function BestellungPage({ searchParams }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const sp = await searchParams;
  const sites = visibleSites(await loadSites(supabase), profile);
  const siteId = pickSite(sites, profile, sp?.site);

  return (
    <PortalShell profile={profile} current="/bestellung"
      sites={sites} activeSite={siteId} title="Bestellungen">
      <BestellungClient profile={profile} sites={sites} activeSite={siteId} />
    </PortalShell>
  );
}
