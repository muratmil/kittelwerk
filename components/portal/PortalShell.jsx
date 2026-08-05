'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { navFor, ROLE_LABELS } from '@/lib/portal';
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

  const NavLinks = ({ onNavigate }) => (
    <>
      {areas.map((a) => {
        const active = a.path === current;
        return (
          <a key={a.path} href={a.path} onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`block px-4 py-3 text-[11px] font-black uppercase tracking-widest border-2 transition-colors
              ${active
                ? 'bg-ink text-white border-ink'
                : 'bg-white border-ink hover:bg-sun'}`}>
            {a.label}
          </a>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-4 border-ink bg-white sticky top-0 z-30">
        <div className="flex items-center gap-4 px-4 md:px-6 h-16">
          <a href="/" className="font-serif font-black text-2xl italic uppercase tracking-tighter shrink-0">
            Kittel<span className="text-tomato">werk</span>.
          </a>

          <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            Portal
          </span>

          {/* Site değiştirici — tek admin, birden çok site */}
          {sites.length > 1 && (
            <div className="flex items-center gap-1 border-2 border-ink">
              {sites.map((s) => {
                const aktiv = s.id === activeSite;
                return (
                  <a key={s.id} href={`${current}?site=${s.id}`}
                    aria-current={aktiv ? 'true' : undefined}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors
                      ${aktiv ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
                    {s.name}
                  </a>
                );
              })}
            </div>
          )}

          {aktuelleSite?.admin_url && (
            <a href={aktuelleSite.admin_url} target="_blank" rel="noreferrer"
              title="Eigenes Panel dieser Seite (noch nicht übernommen)"
              className="hidden lg:flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-sun">
              <ExternalLink size={12} />Altes Panel
            </a>
          )}

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[11px] font-bold">{profile.email}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-tomato">
                {profile.is_owner ? 'Inhaber' : ROLE_LABELS[profile.role]}
              </span>
            </div>
            <button onClick={logout} title="Abmelden"
              className="border-2 border-ink p-2 hover:bg-tomato hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
            <button onClick={() => setOpen((v) => !v)} aria-label="Menü"
              className="md:hidden border-2 border-ink p-2">
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden border-t-2 border-ink p-4 flex flex-col gap-2 bg-paper">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
        )}
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col gap-2 w-56 shrink-0 p-4 border-r-4 border-ink min-h-[calc(100vh-4rem)]">
          <NavLinks />
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-4 border-b-4 border-ink">
            <h1 className="font-serif font-black text-3xl md:text-5xl italic uppercase tracking-tighter leading-none">
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
