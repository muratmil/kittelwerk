import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import PortalShell from '@/components/portal/PortalShell';
import WerkstattClient from './WerkstattClient';

export const metadata = {
  title: 'Werkstatt — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function WerkstattPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <PortalShell profile={profile} current="/werkstatt" title="Werkstatt">
      <WerkstattClient profile={profile} />
    </PortalShell>
  );
}
