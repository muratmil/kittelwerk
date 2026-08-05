import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import PortalShell from '@/components/portal/PortalShell';
import AdminClient from './AdminClient';

export const metadata = {
  title: 'Verwaltung — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <PortalShell profile={profile} current="/admin" title="Verwaltung">
      <AdminClient profile={profile} />
    </PortalShell>
  );
}
