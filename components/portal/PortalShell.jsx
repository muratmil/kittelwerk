'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { navFor, ROLE_LABELS, PORTAL_NAME, PORTAL_SHORT } from '@/lib/portal';
import { LogOut, Menu, X, ExternalLink } from 'lucide-react';

// Dört panelin paylaştığı kabuk. Menüde ne göründüğü role göre değişir;
// owner ve admin bütün alanları görür — "tek platformdan hepsini göreyim".
export default function PortalShell({
  profile, current, title, actions, children,
  sites = [], activeSite = null,
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const areas = navFor(profile.role);
  const aktuelleSite = sites.find((s) => s.id === activeSite);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Site seçici — her portal sayfasında görünür. Seçili site hem fiyat/sipariş
  // bağlamını belirliyor hem de aşağıdaki dış panel bağlantılarını.
  const SiteSwitcher = ({ onNavigate }) => {
    // Tek siteye kısıtlı hesapta seçici yerine sebebini yaz — sessizce
    // kaybolması "özellik yok" gibi görünüyor.
    if (sites.length < 2) {
      if (!profile.is_owner && (profile.site_access ?? []).length > 0) {
        return (
          <div className="rounded-sm bg-cch-ash border border-cch-line p-3 mb-3">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-cch-muted mb-1">Seite</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em]">{sites[0]?.name}</p>
            <p className="text-[10px] text-cch-muted mt-1 leading-snug">
              Ihr Konto ist auf diese Seite beschränkt.
            </p>
          </div>
        );
      }
      return null;
    }
    return (
      <div className="mb-4">
        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-cch-muted mb-2 px-1">
          Seite
        </p>
        <div className="flex flex-col gap-1.5">
          {sites.map((s) => {
            const aktiv = s.id === activeSite;
            return (
              <a key={s.id} href={`${current}?site=${s.id}`} onClick={onNavigate}
                aria-current={aktiv ? 'true' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-[11px] font-medium uppercase tracking-[0.14em] transition-colors
                  ${aktiv ? 'bg-cch-soft text-cch-dark' : 'text-cch-muted hover:bg-cch-ash'}`}>
                <span aria-hidden="true"
                  className={`w-2 h-2 rounded-full shrink-0 ${aktiv ? 'bg-cch-mint' : 'bg-cch-line'}`} />
                {s.name}
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  // Sitenin kendi panelleri. Bir ekran portala taşınana kadar buradan tek
  // tıkla gidiliyor — geçiş dönemi köprüsü, taşındıkça bu liste kısalır.
  const ExternePanels = () => {
    const links = aktuelleSite?.links ?? [];
    if (links.length === 0) return null;
    return (
      <div className="mt-4 pt-4 border-t border-cch-line">
        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-cch-muted mb-2 px-1">
          {aktuelleSite.name} — eigenes Panel
        </p>
        <div className="flex flex-col gap-1.5">
          {links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-[11px] font-medium uppercase tracking-[0.14em] text-cch-muted hover:text-cch-dark hover:bg-cch-ash transition-colors">
              <ExternalLink size={12} className="shrink-0" />
              {l.label}
            </a>
          ))}
        </div>
      </div>
    );
  };

  const NavLinks = ({ onNavigate }) => (
    <>
      {areas.map((a) => {
        const active = a.path === current;
        return (
          <a key={a.path} href={a.path} onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`block px-4 py-2.5 rounded-sm text-[11px] font-medium uppercase tracking-[0.16em] transition-colors border-l-2
              ${active
                ? 'bg-cch-soft text-cch-dark border-cch-mint'
                : 'text-cch-muted border-transparent hover:bg-cch-ash hover:text-cch-slate'}`}>
            {a.label}
          </a>
        );
      })}
    </>
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
          <nav className="md:hidden border-t border-white/10 p-4 flex flex-col gap-2 bg-cch-slate">
            {/* Hangi hesapla girildiği dar ekranda üst barda gizleniyor;
                yanlış hesapla bakıp "özellik yok" sanmak kolay. */}
            <p className="text-[11px] mb-1">
              <span className="font-light text-white/80">{profile.email}</span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.18em] text-cch-mint">
                {profile.is_owner ? 'Inhaber' : ROLE_LABELS[profile.role]}
              </span>
            </p>
            <SiteSwitcher onNavigate={() => setOpen(false)} />
            <NavLinks onNavigate={() => setOpen(false)} />
            <ExternePanels />
          </nav>
        )}
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col gap-2 w-60 shrink-0 p-4 bg-white border-r border-cch-line min-h-[calc(100vh-4rem)]">
          <SiteSwitcher />
          <NavLinks />
          <ExternePanels />
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
