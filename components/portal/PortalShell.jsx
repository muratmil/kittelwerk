'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { navFor, ROLE_LABELS, PORTAL_NAME, PORTAL_SHORT, siteTone } from '@/lib/portal';
import { LogOut, Menu, X, ExternalLink, ChevronDown } from 'lucide-react';

// Dört panelin paylaştığı kabuk. Menüde ne göründüğü role göre değişir;
// owner ve admin bütün alanları görür — "tek platformdan hepsini göreyim".
export default function PortalShell({
  profile, current, title, actions, children,
  sites = [], activeSite = null,
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const areas = navFor(profile.role);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Menü sistem bazlı: her sistemin altında yalnız ona ait sayfalar.
  // Site seçici ayrı bir kutu değil artık — sistemin kendisi başlık.
  const gruplar = useMemo(() => {
    const liste = [];

    for (const site of sites) {
      const alanlar = areas
        .filter((a) => a.path !== '/is-takip')
        // Siparişe kapalı sistemde üretim ve bayi ekranlarının karşılığı yok
        // (Wipello portalda yalnızca görüntüleniyor).
        .filter((a) => site.allows_ordering !== false
                    || a.path === '/admin' || a.path === '/bestellung')
        .map((a) => ({ href: `${a.path}?site=${site.id}`, label: a.label, path: a.path }));

      // Sistemin portala taşınmamış kendi ekranları — geçiş dönemi köprüsü.
      // Bunlar YÖNETİM ekranları (Wipello'nun teklif ve fiyat panelleri),
      // o yüzden yalnız yönetime gösteriliyor. Eskiden herkese görünüyordu:
      // bayi hesabı menüde Wipello'nun fiyat paneline bağlantı görüyordu.
      const yonetim = profile.is_owner || profile.role === 'admin';
      const disLinkler = yonetim
        ? (site.links ?? []).map((l) => ({ href: l.url, label: l.label, dis: true }))
        : [];

      if (alanlar.length || disLinkler.length) {
        liste.push({
          id: site.id, ad: site.name, ton: siteTone(site.id),
          cocuklar: [...alanlar, ...disLinkler],
        });
      }
    }

    // WWS bir siteye bağlı değil, kendi sistemi. Adı AREAS'tan okunuyor ki
    // menü ile sayfa başlığı ayrışmasın.
    const wws = areas.find((a) => a.path === '/is-takip');
    if (wws) {
      liste.push({
        id: 'is-takip', ad: wws.label, ton: siteTone('is-takip'),
        cocuklar: [
          { href: '/is-takip', label: 'Müşteriler', path: '/is-takip' },
          { href: '/is-takip?sekme=yaklasan', label: 'Vadeler', path: '/is-takip' },
        ],
      });
    }

    return liste;
  }, [sites, areas]);

  // Açılışta bulunduğun sistem açık gelsin; her seferinde tıklamak gerekmesin.
  const [acikGrup, setAcikGrup] = useState(
    current === '/is-takip' ? 'is-takip' : (activeSite ?? sites[0]?.id ?? null)
  );

  const SystemNav = ({ onNavigate }) => (
    <nav className="flex flex-col gap-0.5">
      {gruplar.map((g) => {
        const acik = acikGrup === g.id;
        return (
          <div key={g.id}>
            <button type="button" aria-expanded={acik}
              onClick={() => setAcikGrup(acik ? null : g.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-[11px] font-medium uppercase tracking-[0.16em] transition-colors
                ${acik ? 'text-cch-slate bg-cch-ash' : 'text-cch-muted hover:bg-cch-ash hover:text-cch-slate'}`}>
              <span aria-hidden="true"
                className={`w-2 h-2 rounded-full shrink-0 ${g.ton.badge.split(' ')[0]}`} />
              <span className="text-left">{g.ad}</span>
              <ChevronDown size={13} aria-hidden="true"
                className={`ml-auto shrink-0 transition-transform ${acik ? 'rotate-180' : ''}`} />
            </button>

            {acik && (
              <div className="mt-0.5 mb-1 ml-2.5 pl-3 border-l border-cch-line flex flex-col">
                {g.cocuklar.map((c) => {
                  // Dış bağlantı yeni sekmede; portal sayfası aynı sekmede.
                  if (c.dis) {
                    return (
                      <a key={c.href} href={c.href} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-sm text-[11px] text-cch-muted hover:text-cch-dark hover:bg-cch-ash transition-colors">
                        <ExternalLink size={11} className="shrink-0" />
                        {c.label}
                      </a>
                    );
                  }
                  const aktif = c.path === current
                    && (g.id === 'is-takip' || g.id === activeSite);
                  return (
                    <a key={c.href} href={c.href} onClick={onNavigate}
                      aria-current={aktif ? 'page' : undefined}
                      className={`px-3 py-2 rounded-sm text-[11px] transition-colors
                        ${aktif ? 'bg-cch-soft text-cch-dark font-medium' : 'text-cch-muted hover:bg-cch-ash hover:text-cch-slate'}`}>
                      {c.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Hesabı tek siteye kısıtlıysa sebebini yaz — sistemin sessizce
          eksik görünmesi "özellik yok" sanılmasına yol açıyordu. */}
      {!profile.is_owner && (profile.site_access ?? []).length > 0 && (
        <p className="mt-3 px-3 text-[10px] text-cch-muted leading-snug">
          Ihr Konto ist auf {gruplar.length === 1 ? 'diese Seite' : 'diese Seiten'} beschränkt.
        </p>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cch-ash text-cch-slate selection:bg-cch-soft selection:text-cch-dark">
      <header className="bg-cch-slate text-white sticky top-0 z-30">
        <div className="flex items-center gap-4 px-4 md:px-6 h-16">
          <a href="/" className="flex items-baseline gap-2 shrink-0 group">
            <span className="text-lg font-light tracking-[0.3em] uppercase">
              {PORTAL_SHORT}
            </span>
            <span className="hidden lg:inline text-[10px] font-light tracking-[0.25em] uppercase text-white/45 group-hover:text-cch-mint transition-colors">
              {PORTAL_NAME}
            </span>
          </a>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[11px] font-light text-white/80">{profile.email}</span>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-cch-mint">
                {profile.is_owner ? 'Inhaber' : ROLE_LABELS[profile.role]}
              </span>
            </div>
            <button onClick={logout} title="Abmelden"
              className="p-2 rounded-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut size={16} />
            </button>
            <button onClick={() => setOpen((v) => !v)} aria-label="Menü"
              className="md:hidden p-2 rounded-sm text-white/60 hover:text-white hover:bg-white/10">
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden p-4 flex flex-col gap-2 bg-white border-t border-cch-line">
            {/* Hangi hesapla girildiği dar ekranda üst barda gizleniyor;
                yanlış hesapla bakıp "özellik yok" sanmak kolay. */}
            <p className="text-[11px] mb-1 px-3">
              <span className="font-light text-cch-slate">{profile.email}</span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.18em] text-cch-dark">
                {profile.is_owner ? 'Inhaber' : ROLE_LABELS[profile.role]}
              </span>
            </p>
            <SystemNav onNavigate={() => setOpen(false)} />
          </nav>
        )}
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col gap-2 w-60 shrink-0 p-4 bg-white border-r border-cch-line min-h-[calc(100vh-4rem)]">
          <SystemNav />
        </aside>

        <main className="flex-1 min-w-0 p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-4 border-b border-cch-line">
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.12em] uppercase leading-none">
              {title}
            </h1>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
