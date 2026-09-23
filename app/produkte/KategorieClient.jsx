'use client';

import { useState } from 'react';
import Link from 'next/link';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/molecules/ProductCard';

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
  const items = products.filter((p) => p.category === kategorie.key);

  return (
    <main className="min-h-screen bg-paper">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <section className="py-24 bg-paper border-t-4 border-ink">
        <div className="container mx-auto px-6">

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-10">
            <Link href="/" className="hover:text-tomato transition-colors">Kittelwerk</Link>
            <span>/</span>
            <Link href="/produkte" className="hover:text-tomato transition-colors">Produkte</Link>
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
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">Gut zu wissen</p>
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

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/produkte" className="border-2 border-ink px-5 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-ink hover:text-white transition-all">
              ← Alle Produkte
            </Link>
            <Link href="/kontakt" className="bg-tomato text-white px-5 py-3 text-[11px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#111111] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Angebot anfordern
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
