'use client';
import { useState } from 'react';
import Link from 'next/link';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/molecules/ProductCard';
import { useSprache } from '@/components/i18n/SpracheProvider';
import { kategorienListe } from '@/data/kategorien';



export default function ProdukteClient({ products = [] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t, p, lang } = useSprache();
  const L = t.liste;
  const CATEGORIES = kategorienListe(lang);

  return (
    <main className="min-h-screen bg-paper">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <section className="py-24 bg-paper border-t-4 border-ink">
        <div className="container mx-auto px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-10">
            <Link href={p('/')} className="hover:text-tomato transition-colors">{L.kittelwerk}</Link>
            <span>/</span>
            <span className="text-ink opacity-100">{L.produkte}</span>
          </div>

          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{L.kicker}</span>
            <h1 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              {L.titel}
            </h1>
            <p className="mt-3 text-sm font-medium opacity-60">
              {L.text1}<strong>{L.farben}</strong>{L.text2}<strong>{L.menge}</strong>
            </p>
          </div>

          {CATEGORIES.map((cat) => {
            const items = products.filter((p) => p.category === cat.key);
            if (items.length === 0) return null;
            return (
              <div key={cat.key} className="mb-16 last:mb-0">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-4 border-ink pb-3 mb-8">
                  <h2 className="font-serif font-black text-3xl md:text-4xl uppercase italic tracking-tighter">
                    <Link href={p(`/produkte/${cat.slug}`)} className="hover:text-tomato transition-colors">{cat.label}</Link>
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{cat.sub}</span>
                  <Link href={p(`/produkte/${cat.slug}`)} className="ml-auto text-[10px] font-black uppercase tracking-widest text-tomato hover:underline">
                    {L.alleAnsehen}
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-10 bg-sun border-4 border-ink p-4 text-center font-black text-sm shadow-brutalist">
            {L.banner1}<span className="text-tomato">{L.bannerMenge}</span>{L.banner2}
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
