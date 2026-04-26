'use client';
import { useState } from 'react';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import ProductCard from '@/components/molecules/ProductCard';
import CartDrawer from '@/components/cart/CartDrawer';
import CookieBanner from '@/components/layout/CookieBanner';
import Footer from '@/components/layout/Footer';
import { PRODUCTS } from '@/data/products';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <Hero />

      <section id="produkte" className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <span className="text-tomato font-black uppercase tracking-[0.2em] text-[10px]">Unsere Kollektion</span>
            <h2 className="font-serif font-black text-5xl md:text-7xl uppercase italic tracking-tighter mt-2 leading-none">
              Start-Lineup.
            </h2>
          </div>
          <p className="text-[10px] font-bold uppercase underline tracking-widest opacity-50">
            Nur für begrenzte Zeit verfügbar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <CookieBanner />
    </main>
  );
}
