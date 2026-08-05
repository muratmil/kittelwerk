import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import PortalShell from '@/components/portal/PortalShell';
import BestellungClient from './BestellungClient';

export const metadata = {
  title: 'Bestellungen — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function BestellungPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <PortalShell profile={profile} current="/bestellung" title="Bestellungen">
      <BestellungClient profile={profile} />
    </PortalShell>
  );
}
