'use client';
import { useState } from 'react';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import TrustBar from '@/components/sections/TrustBar';
import ProductCard from '@/components/molecules/ProductCard';
import Calculator from '@/components/sections/Calculator';
import Process from '@/components/sections/Process';
import Benefits from '@/components/sections/Benefits';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import FinalCTA from '@/components/sections/FinalCTA';
import VidofoodBanner from '@/components/sections/VidofoodBanner';
import CartDrawer from '@/components/cart/CartDrawer';
import CookieBanner from '@/components/layout/CookieBanner';
import NewsletterPopup from '@/components/layout/NewsletterPopup';
import Footer from '@/components/layout/Footer';
import { PRODUCTS } from '@/data/products';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <Hero />
      <TrustBar />

      <section id="produkte" className="py-24 bg-paper border-t-4 border-ink">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Die Auswahl —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              5 Produkte. <span className="text-tomato">Ein Preis.</span>
            </h2>
            <p className="mt-3 text-sm font-medium opacity-60">
              Alle Artikel in <strong>Schwarz · Weiß · Rot</strong> · Mindestbestellung: <strong>10 Stück gesamt</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 border-4 border-ink bg-ink text-white p-6 shadow-brutalist flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Großbestellung</p>
              <p className="font-serif font-black text-2xl italic tracking-tight leading-none">Händleranfragen & Kooperationen</p>
              <p className="text-sm text-white/50 mt-1">Ab 100 Stück — individuelles Angebot mit Staffelpreisen.</p>
            </div>
            <a href="/kontakt" className="flex-shrink-0 bg-tomato text-white font-black uppercase px-8 py-4 hover:bg-white hover:text-ink transition-all shadow-[4px_4px_0px_0px_#FAFBF7] hover:shadow-none hover:translate-x-1 hover:translate-y-1 whitespace-nowrap">
              Jetzt anfragen →
            </a>
          </div>
        </div>
      </section>

      <Calculator />
      <Process />
      <Benefits />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <VidofoodBanner />
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <CookieBanner />
      <NewsletterPopup />
    </main>
  );
}
