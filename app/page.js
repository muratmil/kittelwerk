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
              Alle Artikel in <strong>Schwarz · Weiß · Rot</strong> · Mindestbestellung: <strong>10 Stück gesamt</strong> · Max. 100 Stück
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 bg-sun border-4 border-ink p-4 text-center font-black text-sm shadow-brutalist">
            ⚡ Mindestbestellmenge: <span className="text-tomato">10 Stück gesamt</span> (Produkte kombinierbar) · Maximum: 100 Stück · Versandkosten: 5,90 € · Druck kostenlos inklusive
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
