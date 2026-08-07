import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProfile } from '@/lib/session';
import { loadSites, visibleSites } from '@/lib/sites';
import { areaLabel, PORTAL_TITLE, ORDER_STATUS, siteTone } from '@/lib/portal';
import { loadMusteriler, loadYaklasan, loadArsiv, loadTumSiparisler } from '@/lib/is-takip';
import PortalShell from '@/components/portal/PortalShell';
import ArsivDugmesi from './ArsivDugmesi';
import { para, tarih, kalanGun, IS_DURUM } from './bicim';

const WWS = areaLabel('/is-takip');

export const metadata = {
  title: `${WWS} — ${PORTAL_TITLE}`,
  robots: { index: false, follow: false },
};

export default async function IsTakipPage({ searchParams }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  // Middleware zaten yönlendiriyor; bu satır sınırın kendisi.
  if (!profile.is_owner) redirect('/admin');

  const sp = await searchParams;
  const SEKMELER = ['musteriler', 'siparisler', 'yaklasan', 'arsiv'];
  const sekme = SEKMELER.includes(sp?.sekme) ? sp.sekme : 'musteriler';

  // Dördü de çekiliyor çünkü sekme başlıklarında sayılar duruyor; veri küçük
  // (birkaç yüz satır) ve sekme değiştirmek sunucuya yeniden gitmek demek.
  const supabase = await createClient();
  const [musteriler, siparisler, yaklasan, arsiv, sites] = await Promise.all([
    loadMusteriler(profile),
    loadTumSiparisler(profile),
    loadYaklasan(profile),
    loadArsiv(profile),
    loadSites(supabase),
  ]);

  const gecikmis = yaklasan.filter((i) => (kalanGun(i.vade) ?? 0) < 0);

  // `sites` menüyü kuruyor, seçici değil — verilmezse yan menüden Kittelwerk
  // ve Wipello komple kaybolur, yalnız WWS kalır. `activeSite` yok:
  // WWS'in Kittelwerk/Wipello ayrımıyla ilgisi yok, kendi sistemi.
  return (
    <PortalShell profile={profile} current="/is-takip" title={WWS}
      sites={visibleSites(sites, profile)}>
      <div className="space-y-4">
        <nav className="flex flex-wrap gap-2">
          <Sekme aktif={sekme === 'musteriler'} href="/is-takip">
            Müşteriler ({musteriler.length})
          </Sekme>
          <Sekme aktif={sekme === 'siparisler'} href="/is-takip?sekme=siparisler">
            Tüm Siparişler ({siparisler.length})
          </Sekme>
          <Sekme aktif={sekme === 'yaklasan'} href="/is-takip?sekme=yaklasan">
            Vadeler ({yaklasan.length}{gecikmis.length ? ` · ${gecikmis.length} gecikmiş` : ''})
          </Sekme>
          <Sekme aktif={sekme === 'arsiv'} href="/is-takip?sekme=arsiv">
            Arşiv ({arsiv.length})
          </Sekme>
        </nav>

        {sekme === 'musteriler' && <MusteriListesi musteriler={musteriler} />}
        {sekme === 'siparisler' && <SiparisListesi kayitlar={siparisler} />}
        {sekme === 'yaklasan' && <VadeListesi isler={yaklasan} />}
        {sekme === 'arsiv' && <ArsivListesi isler={arsiv} />}
      </div>
    </PortalShell>
  );
}

function Sekme({ aktif, href, children }) {
  return (
    <Link href={href}
      className={`px-4 py-2 rounded-sm text-[11px] font-medium uppercase tracking-[0.16em] transition-colors
        ${aktif ? 'bg-cch-mint text-white' : 'bg-white text-cch-muted hover:text-cch-slate'}`}>
      {children}
    </Link>
  );
}

function MusteriListesi({ musteriler }) {
  if (musteriler.length === 0) {
    return (
      <p className="bg-white rounded-sm border border-dashed border-cch-line p-8 text-sm text-cch-muted text-center">
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
          className="bg-white rounded-sm shadow-cch p-4 block border-l-2 border-transparent hover:border-cch-mint hover:shadow-cch-lg transition-all">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-medium tracking-[0.06em]">{m.ad}</span>
            {m.telefon && <span className="text-[11px] text-cch-muted">{m.telefon}</span>}
            <span className="ml-auto flex flex-wrap gap-x-4 gap-y-1 justify-end">
              {m.bakiye.length === 0
                ? <span className="text-[11px] text-cch-muted uppercase tracking-[0.14em]">hareket yok</span>
                : m.bakiye.map((b) => (
                    <span key={b.para_birimi} className="text-right">
                      <span className={`font-medium ${Number(b.kalan) > 0 ? 'text-cch-danger' : 'text-cch-muted'}`}>
                        {para(b.kalan, b.para_birimi)}
                      </span>
                      <span className="block text-[10px] text-cch-muted uppercase tracking-[0.14em]">
                        {para(b.borc, b.para_birimi)} iş · {para(b.tahsilat, b.para_birimi)} tahsil
                      </span>
                    </span>
                  ))}
            </span>
          </div>
          {m.notlar && <p className="text-[11px] text-cch-muted mt-2">{m.notlar}</p>}
        </Link>
      ))}
    </div>
  );
}

/**
 * Üç sistemin siparişleri tek listede — WWS'in "hepsine birden bak" ekranı.
 * Kittelwerk ve Wipello kendi menülerinde yalnız kendi siparişlerini görüyor;
 * karışık görünüm bilerek sadece burada.
 */
function SiparisListesi({ kayitlar }) {
  if (kayitlar.length === 0) {
    return (
      <p className="bg-white rounded-sm border border-dashed border-cch-line p-8 text-sm text-cch-muted text-center">
        Henüz sipariş yok.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {kayitlar.map((k) => {
        const ton = siteTone(k.sistem);
        const durum = k.sistem === 'is-takip' ? IS_DURUM[k.durum] : ORDER_STATUS[k.durum];
        const govde = (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1 rounded-sm ${ton.badge}`}>
                {k.sistemAd}
              </span>
              {k.no && <span className="text-[11px] text-cch-muted">{k.no}</span>}
              <span className="font-medium tracking-[0.06em]">{k.baslik}</span>
              {k.alt && <span className="text-[11px] text-cch-muted">{k.alt}</span>}
              <span className="ml-auto font-medium">{para(k.tutar, k.paraBirimi)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
              {durum && (
                <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1 rounded-sm ${durum.cls}`}>
                  {durum.label}
                </span>
              )}
              <span className="text-[11px] text-cch-muted">{tarih(k.tarih)}</span>
              {/* Arşiv yalnız WWS işlerinde: Kittelwerk/Wipello siparişlerinin
                  kendi durum akışı var, arşiv oraya karışmasın. */}
              {k.isId && (
                <span className="ml-auto">
                  <ArsivDugmesi isId={k.isId} kalan={k.kalan} kucuk />
                </span>
              )}
            </div>
          </>
        );

        const sinif = `bg-white rounded-sm shadow-cch p-4 block border-l-2 ${ton.border}`;
        return k.link
          ? <Link key={k.key} href={k.link} className={`${sinif} hover:shadow-cch-lg transition-all`}>{govde}</Link>
          : <article key={k.key} className={sinif}>{govde}</article>;
      })}
    </div>
  );
}

function ArsivListesi({ isler }) {
  if (isler.length === 0) {
    return (
      <p className="bg-white rounded-sm border border-dashed border-cch-line p-8 text-sm text-cch-muted text-center">
        Arşiv boş. Biten işleri buraya çekerek aktif listeleri sadeleştirebilirsin.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {isler.map((i) => (
        <article key={i.id} className="bg-white rounded-sm shadow-cch p-4 border-l-2 border-cch-line">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link href={`/is-takip/${i.musteri_id}`}
              className="font-medium tracking-[0.06em] hover:text-cch-dark">
              {i.musteri}
            </Link>
            <span className="text-[11px] text-cch-muted">{i.baslik}</span>
            <span className="ml-auto font-medium text-cch-muted">{para(i.tutar, i.para_birimi)}</span>
          </div>
          <p className="text-[11px] text-cch-muted mt-1">{i.kalem_ozeti}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
            <span className="text-[11px] text-cch-muted uppercase tracking-[0.14em]">
              {tarih(i.arsiv_tarihi)} tarihinde arşivlendi
            </span>
            {Number(i.kalan) > 0 && (
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-cch-danger">
                {para(i.kalan, i.para_birimi)} açık
              </span>
            )}
            <span className="ml-auto">
              <ArsivDugmesi isId={i.id} arsivde kucuk />
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function VadeListesi({ isler }) {
  if (isler.length === 0) {
    return (
      <p className="bg-white rounded-sm border border-dashed border-cch-line p-8 text-sm text-cch-muted text-center">
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
            className={`rounded-sm shadow-cch p-4 block border-l-2 transition-all hover:shadow-cch-lg
              ${gecikmis ? 'bg-white border-cch-danger' : 'bg-white border-transparent hover:border-cch-mint'}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-medium tracking-[0.06em]">{i.musteri}</span>
              <span className="text-[11px] text-cch-muted">{i.baslik}</span>
              <span className="ml-auto font-medium">{para(i.kalan, i.para_birimi)}</span>
            </div>
            <p className="text-[11px] text-cch-muted mt-1">{i.kalem_ozeti}</p>
            <p className={`text-[11px] mt-1 font-medium uppercase tracking-[0.14em]
              ${gecikmis ? 'text-cch-danger' : 'text-cch-muted'}`}>
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
