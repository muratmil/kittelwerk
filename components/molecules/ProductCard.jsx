'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductImage from '@/components/atoms/ProductImage';
import { useSprache } from '@/components/i18n/SpracheProvider';

export default function ProductCard({ product }) {
  const { t, p, f, farbe } = useSprache();
  const T = t.produkt;
  // Bald Hier — ürün henüz satista degil: fiyat/sepet yok, sade kart
  if (product.comingSoon) {
    return (
      <div className="border-4 border-ink shadow-brutalist-lg bg-paper flex flex-col">
        <Link href={p(`/produkte/${product.slug ?? product.id}`)} className="relative block group/img">
          <ProductImage src={product.image} backSrc={product.backImage} alt={product.name} />
          <span className="absolute top-3 left-3 bg-ink text-sun text-[9px] font-black uppercase tracking-widest px-2 py-1">
            {T.baldHier}
          </span>
          <span className="absolute inset-0 bg-ink/0 group-hover/img:bg-ink/10 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover/img:opacity-100 bg-ink text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all">
              {T.details}
            </span>
          </span>
        </Link>
        <div className="p-6 flex flex-col gap-4 flex-1">
          <div>
            <h3 className="font-serif font-black text-2xl uppercase italic tracking-tighter">{product.name}</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{product.desc}</p>
          </div>
          <div className="border-2 border-ink p-3 bg-white">
            <span className="font-black text-lg text-ink/60 uppercase tracking-widest">{T.preisBald}</span>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">{T.farbe}</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <span key={c.name} title={farbe(c.name)} style={{ backgroundColor: c.hex }} className="w-7 h-7 border-2 border-ink" />
              ))}
            </div>
          </div>
          <a
            href={`https://wa.me/491749623344?text=${encodeURIComponent(f(T.whatsappBald, { name: product.name }))}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full py-4 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-brutalist transition-all mt-auto bg-olive text-white hover:bg-ink active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {T.benachrichtigen}
          </a>
        </div>
      </div>
    );
  }

  // Katalogkarte ohne Konfiguration (2026-10-24, Murat): Bild, Name, Farben, Einstiegspreis,
  // "Konfigurieren". Menge, Größe und Druck wählt man auf der Produktseite.
  const tiers = [...(product.tiers || [])].sort((a, b) => a.minQty - b.minQty);
  const startPreis = tiers.length ? tiers[0].price : product.newPrice;
  const hatAltpreis = typeof product.oldPrice === 'number' && product.oldPrice > startPreis;
  const savings = hatAltpreis ? ((product.oldPrice - startPreis) / product.oldPrice * 100).toFixed(0) : null;
  const href = p(`/produkte/${product.slug ?? product.id}`);

  return (
    <div className="border-4 border-ink shadow-brutalist-lg bg-paper flex flex-col">
      <Link href={href} className="relative block group/img">
        <ProductImage src={product.image} backSrc={product.backImage} alt={product.name} />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-tomato text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
            {product.badge}
          </span>
        )}
        {hatAltpreis && (
          <span className="absolute top-3 right-3 bg-sun text-ink text-[9px] font-black uppercase px-2 py-1">
            -{savings}%
          </span>
        )}
      </Link>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-serif font-black text-2xl uppercase italic tracking-tighter">
            <Link href={href} className="hover:text-tomato transition-colors">{product.name}</Link>
          </h3>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{product.desc}</p>
        </div>

        <div className="flex gap-2" aria-label={T.farbe}>
          {product.colors.map((c) => (
            <span key={c.name} title={farbe(c.name)} style={{ backgroundColor: c.hex }} className="w-6 h-6 border-2 border-ink" />
          ))}
        </div>

        <div className="mt-auto pt-4 border-t-2 border-ink/15 flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase">
            <span className="opacity-60">{T.ab} </span>
            <span className="font-black text-lg">{startPreis.toFixed(2)}€</span>
            <span className="opacity-60"> {T.proStueck}</span>
          </p>
          <Link href={href}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border-b-2 border-ink pb-0.5 hover:text-tomato hover:border-tomato transition-colors">
            {T.konfigurieren} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
