'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Referenz galerisi (2026-09-29) — müşterilerimizin Kittelwerk'i giyerken
 * çekilmiş fotoğrafları. Veri CCH'den (`lib/referenzen.js`).
 *
 * `vorschau`: ana sayfadaki şerit — başlık + "Alle ansehen" bağlantısı.
 * Büyütme penceresi ProductGallery'deki gibi `document.body`ye taşınıyor
 * (klavye oklar/Esc, parmakla kaydırma).
 */
export default function Referenzen({ referenzen = [], vorschau = false }) {
  const [offen, setOffen] = useState(null);   // açık fotoğrafın sırası
  const [bereit, setBereit] = useState(false);
  const dokunma = useRef(null);

  useEffect(() => setBereit(true), []);

  const gehe = useCallback((yon) => {
    setOffen((i) => (i == null ? i : (i + yon + referenzen.length) % referenzen.length));
  }, [referenzen.length]);

  useEffect(() => {
    if (offen == null) return undefined;
    const tus = (e) => {
      if (e.key === 'Escape') setOffen(null);
      if (e.key === 'ArrowRight') gehe(1);
      if (e.key === 'ArrowLeft') gehe(-1);
    };
    window.addEventListener('keydown', tus);
    const alt = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', tus); document.body.style.overflow = alt; };
  }, [offen, gehe]);

  if (referenzen.length === 0) return null;
  const aktiv = offen != null ? referenzen[offen] : null;

  const raster = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {referenzen.map((r, i) => (
        <figure key={r.id} className="group border-4 border-ink bg-white shadow-brutalist hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutalist-lg transition-all">
          <button type="button" onClick={() => setOffen(i)} aria-label={`${r.titel || 'Referenz'} vergrößern`}
            className="relative block aspect-square w-full overflow-hidden border-b-4 border-ink bg-paper">
            <Image
              src={r.src}
              alt={[r.titel, r.beschreibung].filter(Boolean).join(' — ') || 'Kittelwerk Kundenbeispiel'}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
          {(r.titel || r.beschreibung) && (
            <figcaption className="p-3 md:p-4">
              {r.titel && <p className="font-serif font-black italic uppercase text-sm md:text-base leading-tight">{r.titel}</p>}
              {r.beschreibung && <p className="text-[11px] opacity-60 mt-1 leading-snug">{r.beschreibung}</p>}
              {r.produktHref && (
                <Link href={r.produktHref} className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-tomato hover:underline">
                  Zum Produkt →
                </Link>
              )}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );

  const fenster = aktiv && bereit && createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/95 p-4"
      onClick={() => setOffen(null)}
      onTouchStart={(e) => { dokunma.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (dokunma.current == null) return;
        const fark = e.changedTouches[0].clientX - dokunma.current;
        dokunma.current = null;
        if (Math.abs(fark) > 40) gehe(fark < 0 ? 1 : -1);
      }}
      role="dialog"
      aria-modal="true"
      aria-label={aktiv.titel || 'Referenz'}>
      <button type="button" onClick={() => setOffen(null)} aria-label="Schließen"
        className="absolute top-4 right-4 border-2 border-paper/40 p-2 text-paper hover:border-paper">
        <X size={20} />
      </button>
      {referenzen.length > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); gehe(-1); }} aria-label="Vorheriges Bild"
          className="absolute left-2 md:left-6 z-10 border-2 border-paper/40 p-2 text-paper hover:border-paper">
          <ChevronLeft size={22} />
        </button>
      )}
      <figure className="relative h-[78vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image src={aktiv.src} alt={aktiv.titel || 'Referenz'} fill sizes="100vw" className="object-contain" />
        <figcaption className="absolute -bottom-8 inset-x-0 text-center text-[10px] font-black uppercase tracking-widest text-paper/80">
          {[aktiv.titel, aktiv.beschreibung].filter(Boolean).join(' — ')} · {offen + 1}/{referenzen.length}
        </figcaption>
      </figure>
      {referenzen.length > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); gehe(1); }} aria-label="Nächstes Bild"
          className="absolute right-2 md:right-6 z-10 border-2 border-paper/40 p-2 text-paper hover:border-paper">
          <ChevronRight size={22} />
        </button>
      )}
    </div>,
    document.body,
  );

  if (!vorschau) return <>{raster}{fenster}</>;

  return (
    <section id="referenzen" className="py-24 bg-paper border-t-4 border-ink">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Referenzen —</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            Getragen in <span className="text-tomato">echten Küchen.</span>
          </h2>
          <p className="mt-3 text-sm font-medium opacity-60">So sieht Kittelwerk bei unseren Kunden aus.</p>
        </div>
        {raster}
        <div className="mt-10 text-center">
          <Link href="/referenzen"
            className="inline-block bg-ink text-white px-8 py-4 font-black uppercase tracking-widest text-xs shadow-brutalist hover:bg-tomato transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            Alle Referenzen ansehen →
          </Link>
        </div>
      </div>
      {fenster}
    </section>
  );
}
