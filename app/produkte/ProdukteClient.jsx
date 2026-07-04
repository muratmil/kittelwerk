'use client';
import { useState } from 'react';
import Link from 'next/link';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/molecules/ProductCard';
import { PRODUCTS } from '@/data/products';

const CATEGORIES = [
  { key: 'bekleidung', label: 'Bekleidung', sub: 'T-Shirts, Polos, Hoodies, Jacken & mehr' },
  { key: 'schuerzen', label: 'Schürzen', sub: 'Vorbinder, Latz- & Bistroschürzen' },
  { key: 'accessoires', label: 'Accessoires', sub: 'Kappen, Beanies & Extras' },
];

export default function ProdukteClient() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-paper">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <section className="py-24 bg-paper border-t-4 border-ink">
        <div className="container mx-auto px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-10">
            <Link href="/" className="hover:text-tomato transition-colors">Kittelwerk</Link>
            <span>/</span>
            <span className="text-ink opacity-100">Produkte</span>
          </div>

          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Die Auswahl —</span>
            <h1 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              Unsere Produkte.
            </h1>
            <p className="mt-3 text-sm font-medium opacity-60">
              Alle Artikel in <strong>Schwarz · Weiß · Rot</strong> · Mindestbestellung: <strong>10 Stück gesamt</strong>
            </p>
          </div>

          {CATEGORIES.map((cat) => {
            const items = PRODUCTS.filter((p) => p.category === cat.key);
            if (items.length === 0) return null;
            return (
              <div key={cat.key} className="mb-16 last:mb-0">
                <div className="flex items-baseline gap-4 border-b-4 border-ink pb-3 mb-8">
                  <h2 className="font-serif font-black text-3xl md:text-4xl uppercase italic tracking-tighter">
                    {cat.label}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{cat.sub}</span>
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
            ⚡ Mindestbestellmenge: <span className="text-tomato">10 Stück gesamt</span> (Produkte kombinierbar) · Versandkosten: ab 9,90 € · Logo-Druck kostenlos inklusive
          </div>
        </div>
      </section>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
