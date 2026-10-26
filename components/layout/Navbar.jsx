'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useSprache } from '@/components/i18n/SpracheProvider';
import SprachWahl from '@/components/i18n/SprachWahl';
import PreisModusSchalter from '@/components/atoms/PreisModusSchalter';

// Etiketler sözlükte (`nav.*`), adresler dile göre `p()` ile ön ekleniyor.
const LINKS = [
  { href: '/', key: 'startseite' },
  { href: '/produkte', key: 'produkte' },
  { href: '/druckinfo', key: 'druck' },
  { href: '/referenzen', key: 'referenzen' },
  { href: '/#rechner', key: 'rechner' },
  { href: '/ueber-uns', key: 'ueberUns' },
  { href: '/kontakt', key: 'kontakt' },
];

export default function Navbar({ onOpenCart }) {
  const totalQty = useCartStore((state) => state.getTotalQty());
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, p } = useSprache();

  // Mobilmenü mit Escape schließen
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b-4 border-ink py-4">
      <div className="container mx-auto px-6 flex justify-between items-center gap-6">
        <Link href={p('/')} className="shrink-0 font-serif font-black text-3xl tracking-tighter hover:opacity-80 transition-opacity">
          Kittel<span className="text-tomato">werk</span>.
        </Link>
        {/* Waagrecht erst ab xl, wenn alle Punkte einzeilig passen; darunter das ☰-Menü (2026-10-12) */}
        <div className="hidden xl:flex min-w-0 gap-5 2xl:gap-8 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider 2xl:tracking-widest text-ink/60">
          {LINKS.map((l) => (
            <a key={l.href} href={p(l.href)} className="whitespace-nowrap hover:text-tomato transition-colors">{t.nav[l.key]}</a>
          ))}
        </div>
        {/* Telefonda dar: dil düğmesi eklenince 390 px'e sığmıyordu. */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
          <PreisModusSchalter className="hidden 2xl:inline-flex" />
          <SprachWahl />
          <button onClick={onOpenCart} className="bg-ink text-white px-3 sm:px-4 py-3 flex items-center gap-2 shadow-brutalist hover:bg-tomato transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline font-bold text-sm uppercase">{t.nav.warenkorb}</span>
            <span className="bg-sun text-ink w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">
              {totalQty}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? t.nav.menueSchliessen : t.nav.menueOeffnen}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="xl:hidden border-2 border-ink p-2.5 bg-paper hover:bg-sun transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-menu" className="xl:hidden absolute left-0 right-0 top-full bg-paper border-b-4 border-ink shadow-lg">
          <div className="container mx-auto px-6 py-2 flex flex-col">
            <div className="py-4 border-b border-ink/10 flex items-center justify-between gap-4">
              <span className="font-bold text-sm uppercase tracking-widest text-ink">{t.preisModus.label}</span>
              <PreisModusSchalter />
            </div>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={p(l.href)}
                onClick={() => setMenuOpen(false)}
                className="py-4 border-b border-ink/10 last:border-b-0 font-bold text-sm uppercase tracking-widest text-ink hover:text-tomato transition-colors"
              >
                {t.nav[l.key]}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
