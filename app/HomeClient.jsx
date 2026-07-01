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

export default function HomeClient() {
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
              Die Kollektion. <span className="text-tomato">Ein Preis.</span>
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
          <div className="mt-10 border-4 border-ink bg-sun p-6 shadow-brutalist">
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-3">Zusatzleistungen</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 border-2 border-ink bg-white p-5 space-y-2">
                <p className="font-serif font-black text-lg italic uppercase leading-tight">Kein Vektorlogo?</p>
                <p className="text-[11px] opacity-60 leading-relaxed">Wir vermitteln einen Partner-Grafiker — professionelle Vektorisierung Ihres Logos.</p>
                <a href="/druckinfo#logo" className="inline-block text-[10px] font-black uppercase tracking-widest text-tomato hover:underline">
                  Logo-Erstellungsservice — 100,00 € →
                </a>
              </div>
              <div className="flex-1 border-2 border-ink bg-white p-5 space-y-2">
                <p className="font-serif font-black text-lg italic uppercase leading-tight">Datei bereits vorbereitet?</p>
                <p className="text-[11px] opacity-60 leading-relaxed">Professionelle Prüfung Ihrer Druckdatei auf Auflösung, Farbe und Drucktauglichkeit.</p>
                <a href="/druckinfo#logo" className="inline-block text-[10px] font-black uppercase tracking-widest text-olive hover:underline">
                  Professionelle Datei-Kontrolle — 20,00 € →
                </a>
              </div>
            </div>
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
