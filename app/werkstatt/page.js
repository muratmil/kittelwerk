import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadSites, visibleSites, pickSite } from '@/lib/sites';
import PortalShell from '@/components/portal/PortalShell';
import WerkstattClient from './WerkstattClient';

export const metadata = {
  title: 'Werkstatt — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function WerkstattPage({ searchParams }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const sp = await searchParams;
  const sites = visibleSites(await loadSites(supabase), profile);
  const siteId = pickSite(sites, profile, sp?.site);

  return (
    <PortalShell profile={profile} current="/werkstatt"
      sites={sites} activeSite={siteId} title="Werkstatt">
      <WerkstattClient profile={profile} sites={sites} />
    </PortalShell>
  );
}
