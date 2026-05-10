'use client';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function Navbar({ onOpenCart }) {
  const totalQty = useCartStore((state) => state.getTotalQty());

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b-4 border-ink py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="cursor-pointer">
          <Image src="/images/logo.png" alt="Kittelwerk" width={180} height={50} className="h-10 w-auto object-contain" priority />
        </div>
        <div className="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest text-ink/60">
          <a href="/#produkte" className="hover:text-tomato transition-colors">Produkte</a>
          <a href="/#rechner" className="hover:text-tomato transition-colors">Ersparnis-Rechner</a>
          <a href="/ueber-uns" className="hover:text-tomato transition-colors">Über uns</a>
          <a href="/kontakt" className="hover:text-tomato transition-colors">Kontakt</a>
        </div>
        <button onClick={onOpenCart} className="bg-ink text-white px-4 py-3 flex items-center gap-2 shadow-brutalist hover:bg-tomato transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
          <ShoppingBag size={18} />
          <span className="hidden sm:inline font-bold text-sm uppercase">Warenkorb</span>
          <span className="bg-sun text-ink w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">
            {totalQty}
          </span>
        </button>
      </div>
    </nav>
  );
}
