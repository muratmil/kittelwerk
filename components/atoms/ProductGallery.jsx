'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import ProductImage from '@/components/atoms/ProductImage';

/**
 * Ürün galerisi (2026-09-22'de yenilendi).
 *
 * Eklenenler: büyütme penceresi (klavye + parmakla kaydırma), müşteri
 * çekimlerinin ayrı işaretlenmesi, etiketin görünmesi ve RENGE GÖRE SÜZME.
 *
 * Büyütme penceresi `document.body`ye taşınıyor (portal): galeri yapışkan
 * (sticky) bir kutunun içinde durduğu için `fixed` katman o kutunun yığın
 * bağlamına hapsoluyordu — sayfanın metinleri fotoğrafın ÜSTÜNE biniyordu.
 *
 * Renk: yönetimde bir fotoğrafa renk atanmışsa (`farbe`), müşteri o rengi
 * seçince o fotoğraflar ÖNE alınır ve ilki büyük görsele geçer. Gizlemiyoruz,
 * sıralıyoruz — "Weiß" seçen müşteri de kırmızı baskı örneklerini görebilmeli,
 * yoksa galeri tek fotoğrafa düşüyordu.
 */
export default function ProductGallery({ product, farbe = null }) {
  const alle = useMemo(
    () => (product.gallery ?? []).filter((b) => b && b.src),
    [product.gallery],
  );

  const liste = useMemo(() => {
    if (!farbe || !alle.some((b) => b.farbe === farbe)) return alle;
    // Müşteri çekimleri HER ZAMAN ürün çekimlerinden sonra: yoksa "Schwarz"
    // seçili açılan üründe galeri müşteri fotoğrafıyla başlıyordu.
    const rang = (b) => (b.art === 'kunde' ? 10 : 0) + (b.farbe === farbe ? 0 : !b.farbe ? 1 : 2);
    return [...alle].sort((a, b) => rang(a) - rang(b));
  }, [alle, farbe]);

  const [aktivSrc, setAktivSrc] = useState(liste[0]?.src ?? null);
  const letzteFarbe = useRef(farbe);
  const [gross, setGross] = useState(false);
  const [bereit, setBereit] = useState(false);     // portal ancak tarayıcıda
  const dokunma = useRef(null);

  useEffect(() => setBereit(true), []);

  // Renk değiştiğinde büyük görsel o rengin ilk fotoğrafına atlar.
  useEffect(() => {
    if (letzteFarbe.current === farbe) return;
    letzteFarbe.current = farbe;
    const treffer = alle.find((b) => b.farbe === farbe && b.art !== 'kunde')
      ?? alle.find((b) => b.farbe === farbe);
    if (treffer) setAktivSrc(treffer.src);
  }, [farbe, alle]);

  // Seçili fotoğraf listede değilse ilkine düş.
  const aktivIndex = Math.max(0, liste.findIndex((b) => b.src === aktivSrc));
  const aktiv = liste[aktivIndex] ?? liste[0] ?? null;

  const gehe = useCallback((yon) => {
    if (!liste.length) return;
    const i = (aktivIndex + yon + liste.length) % liste.length;
    setAktivSrc(liste[i].src);
  }, [aktivIndex, liste]);

  // Büyütme penceresi: Esc kapatır, oklar gezinir, sayfa kaymaz.
  useEffect(() => {
    if (!gross) return undefined;
    const tus = (e) => {
      if (e.key === 'Escape') setGross(false);
      if (e.key === 'ArrowRight') gehe(1);
      if (e.key === 'ArrowLeft') gehe(-1);
    };
    window.addEventListener('keydown', tus);
    const alt = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', tus); document.body.style.overflow = alt; };
  }, [gross, gehe]);

  const wischStart = (e) => { dokunma.current = e.touches[0].clientX; };
  const wischEnde = (e) => {
    if (dokunma.current == null) return;
    const fark = e.changedTouches[0].clientX - dokunma.current;
    if (Math.abs(fark) > 40) gehe(fark < 0 ? 1 : -1);
    dokunma.current = null;
  };

  // Tek görsel: eski davranış (üstüne gelince arka yüz).
  if (liste.length < 2) {
    return <ProductImage src={aktiv?.src ?? product.image} backSrc={product.backImage} alt={product.name} priority />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setGross(true)}
        onTouchStart={wischStart}
        onTouchEnd={wischEnde}
        className="relative block aspect-square w-full overflow-hidden border-2 border-ink bg-paper cursor-zoom-in"
        aria-label={`${product.name} vergrößern`}>
        <Image
          key={aktiv.src}
          src={aktiv.src}
          alt={`${product.name} — ${aktiv.label || 'Produktbild'}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain mix-blend-multiply scale-90"
        />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-ink/85 text-paper text-[9px] font-black uppercase tracking-widest px-2 py-1">
          <ZoomIn size={12} />Zoom
        </span>
        {/* Sol ÜST köşe kampanya rozetinin yeri (detay sayfası oraya yazıyor),
            bu yüzden müşteri işareti sol ALTA konuyor. */}
        {aktiv.art === 'kunde' && (
          <span className="absolute bottom-2 left-2 bg-tomato text-paper text-[9px] font-black uppercase tracking-widest px-2 py-1">
            Kundenfoto
          </span>
        )}
      </button>

      {aktiv.label && (
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60">{aktiv.label}</p>
      )}

      <div className="grid grid-cols-5 gap-2 mt-2">
        {liste.map((img) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setAktivSrc(img.src)}
            title={img.label}
            aria-label={img.label || product.name}
            aria-current={img.src === aktiv.src}
            className={`relative aspect-square overflow-hidden border-2 transition-all bg-paper
              ${img.src === aktiv.src ? 'border-tomato shadow-brutalist' : 'border-ink/30 hover:border-ink'}`}>
            <Image
              src={img.src}
              alt=""
              fill
              sizes="80px"
              className="object-contain mix-blend-multiply scale-90"
            />
          </button>
        ))}
      </div>

      {gross && bereit && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setGross(false)}
          onTouchStart={wischStart}
          onTouchEnd={wischEnde}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}>
          <button type="button" onClick={() => setGross(false)} aria-label="Schließen"
            className="absolute top-4 right-4 border-2 border-paper/40 p-2 text-paper hover:border-paper">
            <X size={20} />
          </button>

          <button type="button" onClick={(e) => { e.stopPropagation(); gehe(-1); }} aria-label="Vorheriges Bild"
            className="absolute left-2 md:left-6 border-2 border-paper/40 p-2 text-paper hover:border-paper">
            <ChevronLeft size={22} />
          </button>

          <figure className="relative h-[78vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={aktiv.src}
              alt={`${product.name} — ${aktiv.label || 'Produktbild'}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <figcaption className="absolute -bottom-8 inset-x-0 text-center text-[10px] font-black uppercase tracking-widest text-paper/80">
              {aktiv.label || product.name} · {aktivIndex + 1}/{liste.length}
            </figcaption>
          </figure>

          <button type="button" onClick={(e) => { e.stopPropagation(); gehe(1); }} aria-label="Nächstes Bild"
            className="absolute right-2 md:right-6 border-2 border-paper/40 p-2 text-paper hover:border-paper">
            <ChevronRight size={22} />
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}
