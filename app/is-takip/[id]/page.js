import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadSites, visibleSites } from '@/lib/sites';
import { areaLabel, PORTAL_TITLE } from '@/lib/portal';
import { loadMusteri } from '@/lib/is-takip';
import PortalShell from '@/components/portal/PortalShell';
import { para, tarih, kalanGun, olcuYaz, IS_DURUM, KALEM_DURUM } from '../bicim';

export const metadata = {
  title: `Müşteri — ${areaLabel('/is-takip')} — ${PORTAL_TITLE}`,
  robots: { index: false, follow: false },
};

export default async function MusteriDetay({ params }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  if (!profile.is_owner) redirect('/admin');

  const { id } = await params;
  const veri = await loadMusteri(profile, id);
  if (!veri) notFound();

  const { musteri, cari, isler, odemeler } = veri;

  // `sites` menüyü kuruyor — verilmezse yan menüde yalnız WWS kalır.
  const sites = visibleSites(await loadSites(await createClient()), profile);

  return (
    <PortalShell profile={profile} current="/is-takip" title={musteri.ad}
      sites={sites}>
      <div className="space-y-6">
        <Link href="/is-takip" className="text-[11px] uppercase tracking-[0.16em] text-cch-muted hover:text-cch-dark transition-colors">
          ← Müşteriler
        </Link>

        {(musteri.telefon || musteri.eposta || musteri.notlar) && (
          <p className="text-[11px] text-cch-muted">
            {[musteri.telefon, musteri.eposta].filter(Boolean).join(' · ')}
            {musteri.notlar ? ` — ${musteri.notlar}` : ''}
          </p>
        )}

        {/* --- cari özet --- */}
        <div className="flex flex-wrap gap-3">
          {cari.length === 0 ? (
            <p className="text-[11px] text-cch-muted uppercase tracking-[0.14em]">Hareket yok</p>
          ) : cari.map((c) => (
            <div key={c.para_birimi} className="bg-white rounded-sm shadow-cch p-5 min-w-[200px] border-t-2 border-cch-mint">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-cch-muted">
                Cari — {c.para_birimi}
              </p>
              <p className={`text-2xl font-light mt-1.5 ${Number(c.kalan) > 0 ? 'text-cch-danger' : 'text-cch-slate'}`}>
                {para(c.kalan, c.para_birimi)}
              </p>
              <p className="text-[10px] text-cch-muted uppercase tracking-[0.14em] mt-1.5">
                {para(c.borc, c.para_birimi)} iş · {para(c.tahsilat, c.para_birimi)} tahsil
              </p>
            </div>
          ))}
        </div>

        {/* --- işler --- */}
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cch-muted mb-3">İşler</h2>
          {isler.length === 0 ? (
            <p className="bg-white rounded-sm border border-dashed border-cch-line p-8 text-sm text-cch-muted text-center">İş kaydı yok.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {isler.map((is) => {
                const durum = IS_DURUM[is.durum] ?? { label: is.durum, cls: 'bg-ink/10' };
                const gun = kalanGun(is.vade);
                const gecikmis = Number(is.kalan) > 0 && gun !== null && gun < 0;
                return (
                  <article key={is.id} className="bg-white rounded-sm shadow-cch p-5">
                    <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-medium tracking-[0.06em]">{is.baslik ?? '(başlıksız)'}</span>
                      <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2.5 py-1 rounded-sm ${durum.cls}`}>
                        {durum.label}
                      </span>
                      <span className="ml-auto text-[11px] text-cch-muted">{tarih(is.olusturma)}</span>
                    </header>

                    {is.aciklama && <p className="text-[11px] text-cch-muted mt-1">{is.aciklama}</p>}

                    {/* Ne · ne ölçüde · ne kadar */}
                    <ul className="mt-3 flex flex-col gap-2">
                      {is.kalemler.map((k) => (
                        <li key={k.id} className="bg-cch-ash rounded-sm px-3 py-2.5">
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="font-medium text-[13px]">{k.ne}</span>
                            {k.adet > 1 && <span className="text-[11px] text-cch-muted">×{k.adet}</span>}
                            <span className="text-[10px] uppercase tracking-[0.14em] text-cch-muted">
                              {KALEM_DURUM[k.durum] ?? k.durum}
                            </span>
                            <span className="ml-auto font-medium">{para(k.tutar, is.para_birimi)}</span>
                          </div>
                          {k.aciklama && <p className="text-[11px] text-cch-muted">{k.aciklama}</p>}
                          {k.olculer.length > 0 && (
                            <p className="text-[11px] text-cch-dark mt-1">
                              {k.olculer.map(olcuYaz).join('  ·  ')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Ne kadar · ne kadar ödenmiş · kalan */}
                    <footer className="mt-4 pt-3 border-t border-cch-line flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
                      <span className="uppercase tracking-[0.14em] text-cch-muted">
                        Tutar <b className="font-medium text-cch-slate">{para(is.tutar, is.para_birimi)}</b>
                      </span>
                      <span className="uppercase tracking-[0.14em] text-cch-muted">
                        Ödenen <b className="font-medium text-cch-slate">{para(is.odenen, is.para_birimi)}</b>
                      </span>
                      <span className={`uppercase tracking-[0.14em] ${Number(is.kalan) > 0 ? 'text-cch-danger' : 'text-cch-muted'}`}>
                        Kalan <b className="font-medium">{para(is.kalan, is.para_birimi)}</b>
                      </span>
                      {is.vade && (
                        <span className={`ml-auto uppercase tracking-[0.14em] ${gecikmis ? 'text-cch-danger font-medium' : 'text-cch-muted'}`}>
                          Vade {tarih(is.vade)}
                          {gecikmis && ` · ${Math.abs(gun)} gün gecikti`}
                        </span>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* --- ödeme geçmişi --- */}
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cch-muted mb-3">
            Ödeme geçmişi
          </h2>
          {odemeler.length === 0 ? (
            <p className="bg-white rounded-sm border border-dashed border-cch-line p-8 text-sm text-cch-muted text-center">
              Henüz tahsilat kaydı yok.
            </p>
          ) : (
            <div className="bg-white rounded-sm shadow-cch divide-y divide-cch-line">
              {odemeler.map((o) => (
                <div key={o.id} className="p-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em]">{tarih(o.tarih)}</span>
                  <span className="text-[11px] text-cch-muted">
                    {[o.yontem, o.aciklama].filter(Boolean).join(' · ')}
                    {!o.is_id && <span className="text-cch-muted"> (cariye)</span>}
                  </span>
                  <span className="ml-auto font-medium text-cch-dark">{para(o.tutar, o.para_birimi)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
