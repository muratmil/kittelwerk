import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import PortalShell from '@/components/portal/PortalShell';
import { PERMISSIONS, ROLE_LABELS, hasPermission } from '@/lib/portal';

export const metadata = {
  title: 'Verwaltung — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

// Bu ekran henüz taşınmadı. Şimdilik oturumun gerçekten hangi yetkilerle
// açıldığını gösteriyor — yetki modelini gözle doğrulamak için işe yarıyor.
export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <PortalShell profile={profile} current="/admin" title="Verwaltung">
      <div className="space-y-6 max-w-2xl">
        <p className="border-4 border-sun bg-sun/20 p-4 text-sm">
          <strong className="block font-black uppercase text-[11px] tracking-widest mb-1">
            Nächster Schritt
          </strong>
          Die Verwaltung wird als Nächstes hierher übernommen: Bestellübersicht,
          Benutzerverwaltung und Preispflege.
        </p>

        <section className="border-4 border-ink bg-white shadow-brutalist p-5">
          <h2 className="font-black text-sm uppercase tracking-widest border-b-2 border-ink pb-2 mb-4">
            Ihre Sitzung
          </h2>
          <dl className="text-sm space-y-2">
            <div className="flex gap-3">
              <dt className="w-28 text-[10px] font-black uppercase tracking-widest opacity-50 pt-0.5">Konto</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 text-[10px] font-black uppercase tracking-widest opacity-50 pt-0.5">Rolle</dt>
              <dd className="font-bold">
                {profile.is_owner ? 'Inhaber — kann nicht gelöscht werden' : ROLE_LABELS[profile.role]}
              </dd>
            </div>
          </dl>

          <h3 className="font-black text-[11px] uppercase tracking-widest mt-6 mb-2">Berechtigungen</h3>
          <ul className="grid sm:grid-cols-2 gap-1.5">
            {PERMISSIONS.map((p) => {
              const on = hasPermission(profile, p.key);
              return (
                <li key={p.key} className="flex items-center gap-2 text-[12px]">
                  <span aria-hidden="true"
                    className={`inline-block w-3.5 h-3.5 border-2 border-ink shrink-0 ${on ? 'bg-olive' : 'bg-white'}`} />
                  <span className={on ? 'font-bold' : 'opacity-40'}>{p.label}</span>
                </li>
              );
            })}
          </ul>
          {profile.is_owner && (
            <p className="text-[11px] opacity-60 mt-3 leading-relaxed">
              Als Inhaber haben Sie automatisch jede Berechtigung. Admins sehen beim Anlegen
              eines neuen Kontos nur die Kästchen, die sie selbst besitzen.
            </p>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
