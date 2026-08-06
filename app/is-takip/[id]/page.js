import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import { loadMusteri } from '@/lib/is-takip';
import PortalShell from '@/components/portal/PortalShell';
import { para, tarih, kalanGun, olcuYaz, IS_DURUM, KALEM_DURUM } from '../bicim';

export const metadata = {
  title: 'Müşteri — İş Takip — Central Communication Hub (CCH)',
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

  return (
    <PortalShell profile={profile} current="/is-takip" title={musteri.ad}>
      <div className="space-y-6">
        <Link href="/is-takip" className="text-[11px] font-black uppercase tracking-widest hover:bg-sun">
          ← Müşteriler
        </Link>

        {(musteri.telefon || musteri.eposta || musteri.notlar) && (
          <p className="text-[11px] opacity-60">
            {[musteri.telefon, musteri.eposta].filter(Boolean).join(' · ')}
            {musteri.notlar ? ` — ${musteri.notlar}` : ''}
          </p>
        )}

        {/* --- cari özet --- */}
        <div className="flex flex-wrap gap-3">
          {cari.length === 0 ? (
            <p className="text-[11px] opacity-40 uppercase tracking-widest">Hareket yok</p>
          ) : cari.map((c) => (
            <div key={c.para_birimi} className="border-4 border-ink bg-white shadow-brutalist p-4 min-w-[190px]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-50">
                Cari — {c.para_birimi}
              </p>
              <p className={`text-2xl font-black mt-1 ${Number(c.kalan) > 0 ? 'text-tomato' : ''}`}>
                {para(c.kalan, c.para_birimi)}
              </p>
              <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">
                {para(c.borc, c.para_birimi)} iş · {para(c.tahsilat, c.para_birimi)} tahsil
              </p>
            </div>
          ))}
        </div>

        {/* --- işler --- */}
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] opacity-50 mb-2">İşler</h2>
          {isler.length === 0 ? (
            <p className="border-2 border-dashed border-ink/30 p-6 text-sm opacity-50">İş kaydı yok.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {isler.map((is) => {
                const durum = IS_DURUM[is.durum] ?? { label: is.durum, cls: 'bg-ink/10' };
                const gun = kalanGun(is.vade);
                const gecikmis = Number(is.kalan) > 0 && gun !== null && gun < 0;
                return (
                  <article key={is.id} className="border-4 border-ink bg-white shadow-brutalist p-4">
                    <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-black uppercase tracking-wide">{is.baslik ?? '(başlıksız)'}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-1 ${durum.cls}`}>
                        {durum.label}
                      </span>
                      <span className="ml-auto text-[11px] opacity-50">{tarih(is.olusturma)}</span>
                    </header>

                    {is.aciklama && <p className="text-[11px] opacity-60 mt-1">{is.aciklama}</p>}

                    {/* Ne · ne ölçüde · ne kadar */}
                    <ul className="mt-3 flex flex-col gap-2">
                      {is.kalemler.map((k) => (
                        <li key={k.id} className="border-2 border-ink/15 p-2">
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="font-black text-[13px]">{k.ne}</span>
                            {k.adet > 1 && <span className="text-[11px] opacity-60">×{k.adet}</span>}
                            <span className="text-[10px] uppercase tracking-widest opacity-40">
                              {KALEM_DURUM[k.durum] ?? k.durum}
                            </span>
                            <span className="ml-auto font-black">{para(k.tutar, is.para_birimi)}</span>
                          </div>
                          {k.aciklama && <p className="text-[11px] opacity-60">{k.aciklama}</p>}
                          {k.olculer.length > 0 && (
                            <p className="text-[11px] opacity-70 mt-1">
                              {k.olculer.map(olcuYaz).join('  ·  ')}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Ne kadar · ne kadar ödenmiş · kalan */}
                    <footer className="mt-3 pt-3 border-t-2 border-ink/15 flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
                      <span className="uppercase tracking-widest opacity-50">
                        Tutar <b className="opacity-100 not-italic">{para(is.tutar, is.para_birimi)}</b>
                      </span>
                      <span className="uppercase tracking-widest opacity-50">
                        Ödenen <b className="opacity-100">{para(is.odenen, is.para_birimi)}</b>
                      </span>
                      <span className={`uppercase tracking-widest ${Number(is.kalan) > 0 ? 'text-tomato' : 'opacity-50'}`}>
                        Kalan <b>{para(is.kalan, is.para_birimi)}</b>
                      </span>
                      {is.vade && (
                        <span className={`ml-auto uppercase tracking-widest ${gecikmis ? 'text-tomato font-black' : 'opacity-50'}`}>
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
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] opacity-50 mb-2">
            Ödeme geçmişi
          </h2>
          {odemeler.length === 0 ? (
            <p className="border-2 border-dashed border-ink/30 p-6 text-sm opacity-50">
              Henüz tahsilat kaydı yok.
            </p>
          ) : (
            <div className="border-4 border-ink bg-white shadow-brutalist divide-y-2 divide-ink/10">
              {odemeler.map((o) => (
                <div key={o.id} className="p-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest">{tarih(o.tarih)}</span>
                  <span className="text-[11px] opacity-60">
                    {[o.yontem, o.aciklama].filter(Boolean).join(' · ')}
                    {!o.is_id && <span className="opacity-60"> (cariye)</span>}
                  </span>
                  <span className="ml-auto font-black text-olive">{para(o.tutar, o.para_birimi)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
