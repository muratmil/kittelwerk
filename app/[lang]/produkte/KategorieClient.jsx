'use client';

import { useState } from 'react';
import Link from 'next/link';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/molecules/ProductCard';
import { useSprache } from '@/components/i18n/SpracheProvider';

/**
 * Kategori sayfası (2026-09-23).
 *
 * Neden ayrı sayfa: Google'da sıralamayı adresin derinliği değil, kendi
 * metni ve başlığı olan bir sayfa getiriyor. Ürün adresleri (/produkte/<id>)
 * bilerek DEĞİŞMEDİ — onlar zaten indeksli, taşımak birkaç haftalık
 * dalgalanma riski demekti.
 *
 * Metinler `KATEGORIE_TEXTE` içinde, sayfa dosyaları oradan besleniyor.
 */
export default function KategorieClient({ kategorie, products = [] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t, p } = useSprache();
  const L = t.liste;
  const items = products.filter((p) => p.category === kategorie.key);

  return (
    <main className="min-h-screen bg-paper">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <section className="py-24 bg-paper border-t-4 border-ink">
        <div className="container mx-auto px-6">

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-10">
            <Link href={p('/')} className="hover:text-tomato transition-colors">{L.kittelwerk}</Link>
            <span>/</span>
            <Link href={p('/produkte')} className="hover:text-tomato transition-colors">{L.produkte}</Link>
            <span>/</span>
            <span className="text-ink opacity-100">{kategorie.label}</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— {kategorie.eyebrow} —</span>
            <h1 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              {kategorie.h1}
            </h1>
            <p className="mt-5 text-base leading-relaxed opacity-75 border-l-4 border-tomato pl-4">
              {kategorie.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {kategorie.hinweise?.length > 0 && (
            <div className="mt-14 border-4 border-ink bg-white p-6 shadow-brutalist max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">{L.gutZuWissen}</p>
              <ul className="space-y-2 text-sm">
                {kategorie.hinweise.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-tomato font-black">—</span>
                    <span className="opacity-80">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {kategorie.ratgeber && <Ratgeber r={kategorie.ratgeber} p={p} />}

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={p('/produkte')} className="border-2 border-ink px-5 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-ink hover:text-white transition-all">
              {L.alleProdukte}
            </Link>
            <Link href={p('/kontakt')} className="bg-tomato text-white px-5 py-3 text-[11px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#111111] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              {L.angebot}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}

// Ratgeber-Abschnitt (2026-10-27, SEO): nur Kategorien mit `ratgeber` im Wörterbuch.
function Ratgeber({ r, p }) {
  return (
    <section className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-serif font-black text-2xl md:text-3xl uppercase italic tracking-tighter leading-tight mb-5">{r.h2}</h2>
        <div className="space-y-4 text-[15px] leading-relaxed opacity-80">
          {r.absaetze.map((a) => <p key={a}>{a}</p>)}
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {r.schritte.map((s, i) => (
            <li key={s.t} className="border-2 border-ink bg-white p-4">
              <span className="text-tomato font-black">{i + 1}.</span> <span className="font-bold">{s.t}</span>
              <p className="mt-1 text-[14px] opacity-75">{s.d}</p>
            </li>
          ))}
        </ol>
        <Link href={p('/druckinfo')} className="inline-block mt-6 text-[11px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-tomato">Druck & Stickerei im Detail →</Link>
      </div>
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-3">Häufige Fragen</h3>
        <div className="border-2 border-ink divide-y-2 divide-ink/10 bg-white">
          {r.faq.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer font-bold text-[14px] list-none flex justify-between gap-3">
                {f.q}<span className="group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed opacity-80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
