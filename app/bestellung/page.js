import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadSites, visibleSites } from '@/lib/sites';
import PortalShell from '@/components/portal/PortalShell';
import BestellungClient from './BestellungClient';

export const metadata = {
  title: 'Bestellungen — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function BestellungPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const sites = visibleSites(await loadSites(supabase), profile);

  return (
    <PortalShell profile={profile} current="/bestellung" title="Bestellungen">
      <BestellungClient profile={profile} sites={sites} />
    </PortalShell>
  );
}
