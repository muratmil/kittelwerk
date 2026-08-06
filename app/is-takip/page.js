import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/session';
import { loadMusteriler, loadYaklasan } from '@/lib/is-takip';
import PortalShell from '@/components/portal/PortalShell';
import { para, tarih, kalanGun } from './bicim';

export const metadata = {
  title: 'İş Takip — Kittelwerk Portal',
  robots: { index: false, follow: false },
};

export default async function IsTakipPage({ searchParams }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  // Middleware zaten yönlendiriyor; bu satır sınırın kendisi.
  if (!profile.is_owner) redirect('/admin');

  const sp = await searchParams;
  const sekme = sp?.sekme === 'yaklasan' ? 'yaklasan' : 'musteriler';

  const [musteriler, yaklasan] = await Promise.all([
    loadMusteriler(profile),
    loadYaklasan(profile),
  ]);

  const gecikmis = yaklasan.filter((i) => (kalanGun(i.vade) ?? 0) < 0);

  // Site seçici bilerek verilmiyor: iş takibin Kittelwerk/Wipello ayrımıyla
  // ilgisi yok, seçici burada tıklanınca hiçbir şey değiştirmezdi.
  return (
    <PortalShell profile={profile} current="/is-takip" title="İş Takip">
      <div className="space-y-4">
        <nav className="flex flex-wrap gap-2">
          <Sekme aktif={sekme === 'musteriler'} href="/is-takip">
            Müşteriler ({musteriler.length})
          </Sekme>
          <Sekme aktif={sekme === 'yaklasan'} href="/is-takip?sekme=yaklasan">
            Vadeler ({yaklasan.length}{gecikmis.length ? ` · ${gecikmis.length} gecikmiş` : ''})
          </Sekme>
        </nav>

        {sekme === 'musteriler'
          ? <MusteriListesi musteriler={musteriler} />
          : <VadeListesi isler={yaklasan} />}
      </div>
    </PortalShell>
  );
}

function Sekme({ aktif, href, children }) {
  return (
    <Link href={href}
      className={`border-2 border-ink px-4 py-2 text-[11px] font-black uppercase tracking-widest
        ${aktif ? 'bg-ink text-white' : 'bg-white hover:bg-sun'}`}>
      {children}
    </Link>
  );
}

function MusteriListesi({ musteriler }) {
  if (musteriler.length === 0) {
    return (
      <p className="border-2 border-dashed border-ink/30 p-6 text-sm opacity-50">
        Henüz müşteri yok. Sesle kayıt açtığında burada görünecek.
      </p>
    );
  }

  // Borcu olan üstte: ekrana bakma sebebi zaten "kim ne kadar borçlu".
  const sirali = [...musteriler].sort((a, b) => enBuyukKalan(b) - enBuyukKalan(a));

  return (
    <div className="flex flex-col gap-3">
      {sirali.map((m) => (
        <Link key={m.id} href={`/is-takip/${m.id}`}
          className="border-4 border-ink bg-white shadow-brutalist p-4 hover:bg-sun/20 block">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-black uppercase tracking-wide">{m.ad}</span>
            {m.telefon && <span className="text-[11px] opacity-50">{m.telefon}</span>}
            <span className="ml-auto flex flex-wrap gap-x-4 gap-y-1 justify-end">
              {m.bakiye.length === 0
                ? <span className="text-[11px] opacity-40 uppercase tracking-widest">hareket yok</span>
                : m.bakiye.map((b) => (
                    <span key={b.para_birimi} className="text-right">
                      <span className={`font-black ${Number(b.kalan) > 0 ? 'text-tomato' : 'opacity-40'}`}>
                        {para(b.kalan, b.para_birimi)}
                      </span>
                      <span className="block text-[10px] opacity-50 uppercase tracking-widest">
                        {para(b.borc, b.para_birimi)} iş · {para(b.tahsilat, b.para_birimi)} tahsil
                      </span>
                    </span>
                  ))}
            </span>
          </div>
          {m.notlar && <p className="text-[11px] opacity-60 mt-2">{m.notlar}</p>}
        </Link>
      ))}
    </div>
  );
}

function VadeListesi({ isler }) {
  if (isler.length === 0) {
    return (
      <p className="border-2 border-dashed border-ink/30 p-6 text-sm opacity-50">
        Vadesi girilmiş açık iş yok.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {isler.map((i) => {
        const gun = kalanGun(i.vade);
        const gecikmis = gun !== null && gun < 0;
        return (
          <Link key={i.id} href={`/is-takip/${i.musteri_id}`}
            className={`border-4 border-ink shadow-brutalist p-4 block hover:bg-sun/20
              ${gecikmis ? 'bg-tomato/10' : 'bg-white'}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-black uppercase tracking-wide">{i.musteri}</span>
              <span className="text-[11px] opacity-60">{i.baslik}</span>
              <span className="ml-auto font-black">{para(i.kalan, i.para_birimi)}</span>
            </div>
            <p className="text-[11px] opacity-60 mt-1">{i.kalem_ozeti}</p>
            <p className={`text-[11px] mt-1 font-black uppercase tracking-widest
              ${gecikmis ? 'text-tomato' : 'opacity-60'}`}>
              {tarih(i.vade)}
              {gun !== null && (gecikmis ? ` · ${Math.abs(gun)} gün gecikti` : ` · ${gun} gün kaldı`)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

function enBuyukKalan(m) {
  return m.bakiye.reduce((enB, b) => Math.max(enB, Number(b.kalan) || 0), 0);
}
