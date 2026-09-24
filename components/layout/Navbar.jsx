'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Startseite' },
  { href: '/produkte', label: 'Produkte' },
  { href: '/druckinfo', label: 'Druck & Stickerei' },
  { href: '/#rechner', label: 'Ersparnis-Rechner' },
  { href: '/ueber-uns', label: 'Über uns' },
  { href: '/kontakt', label: 'Kontakt' },
];

export default function Navbar({ onOpenCart }) {
  const totalQty = useCartStore((state) => state.getTotalQty());
  const [menuOpen, setMenuOpen] = useState(false);

  // Mobilmenü mit Escape schließen
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b-4 border-ink py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="font-serif font-black text-3xl tracking-tighter hover:opacity-80 transition-opacity">
          Kittel<span className="text-tomato">werk</span>.
        </Link>
        <div className="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest text-ink/60">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-tomato transition-colors">{l.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenCart} className="bg-ink text-white px-4 py-3 flex items-center gap-2 shadow-brutalist hover:bg-tomato transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline font-bold text-sm uppercase">Warenkorb</span>
            <span className="bg-sun text-ink w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">
              {totalQty}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden border-2 border-ink p-2.5 bg-paper hover:bg-sun transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden absolute left-0 right-0 top-full bg-paper border-b-4 border-ink shadow-lg">
          <div className="container mx-auto px-6 py-2 flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="py-4 border-b border-ink/10 last:border-b-0 font-bold text-sm uppercase tracking-widest text-ink hover:text-tomato transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
