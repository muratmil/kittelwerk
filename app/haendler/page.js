import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import PortalShell from '@/components/portal/PortalShell';

export const metadata = {
  title: 'Händler — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

// Henüz taşınmadı — bayi siparişi ve durum takibi bir sonraki adımda geliyor.
export default async function HaendlerPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  const istHaendler = profile.role === 'haendler';

  return (
    <PortalShell profile={profile} current="/haendler" title="Händler">
      <div className="max-w-2xl space-y-4">
        <p className="border-4 border-sun bg-sun/20 p-4 text-sm">
          <strong className="block font-black uppercase text-[11px] tracking-widest mb-1">
            Nächster Schritt
          </strong>
          Bestellung aufgeben, eigene Aufträge verfolgen und Konditionen einsehen —
          wird als Nächstes hierher übernommen.
        </p>

        {!istHaendler && (
          <p className="border-2 border-ink bg-white p-4 text-sm">
            Sie sind als <strong>{profile.is_owner ? 'Inhaber' : 'Admin'}</strong> hier.
            Bestellungen aus diesem Bereich laufen später auf den Namen der Firma
            (<code className="text-[12px]">intern</code>) — nicht auf einen Händler.
            Niemand bestellt im Namen eines anderen.
          </p>
        )}
      </div>
    </PortalShell>
  );
}
