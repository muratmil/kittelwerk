'use client';
import { useState } from 'react';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import TrustBar from '@/components/sections/TrustBar';
import Link from 'next/link';
import ProductCard from '@/components/molecules/ProductCard';

// Ürünler sayfasındakiyle AYNI sıra ve adlar; ikisi ayrışırsa müşteri
// ana sayfada gördüğü grubu listede bulamaz.
const KATEGORIEN = [
  { key: 'bekleidung', slug: 'arbeitskleidung', label: 'Arbeitskleidung', sub: 'T-Shirts, Polos, Hoodies, Jacken & mehr' },
  { key: 'schuerzen', slug: 'schuerzen', label: 'Schürzen', sub: 'Vorbinder-, Latz- & Barista-Schürzen' },
  { key: 'accessoires', slug: 'accessoires', label: 'Accessoires', sub: 'Kappen, Beanies & Extras' },
];
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


export default function HomeClient({ products = [] }) {
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
              Logo-Druck inklusive · Mindestbestellung: <strong>10 Stück gesamt</strong> · Produkte kombinierbar
            </p>
          </div>

          {/* Ürünler kategori kategori (2026-09-23): tek uzun ızgarada önlük ile
              tişört yan yana düşüyordu; müşteri aradığı grubu bulamıyordu. */}
          <div className="space-y-16">
            {KATEGORIEN.map((kat) => {
              const liste = products.filter((p) => (p.category ?? 'arbeitskleidung') === kat.key);
              if (liste.length === 0) return null;
              return (
                <div key={kat.key}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-4 border-ink pb-3 mb-8">
                    <h3 className="font-serif font-black text-2xl md:text-3xl uppercase italic tracking-tighter leading-none">
                      <Link href={`/produkte/${kat.slug}`} className="hover:text-tomato transition-colors">{kat.label}</Link>
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{kat.sub}</span>
                    <Link href={`/produkte/${kat.slug}`} className="ml-auto text-[10px] font-black uppercase tracking-widest text-tomato hover:underline">
                      Alle ansehen →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {liste.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
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

      <Calculator products={products} />
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
