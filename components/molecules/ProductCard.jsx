'use client';
import { useState } from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import ProductImage from '@/components/atoms/ProductImage';
import { useCartStore } from '@/store/cartStore';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState(product.hasSizes ? 'M' : '-');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const savings = ((product.oldPrice - product.newPrice) / product.oldPrice * 100).toFixed(0);

  return (
    <div className="border-4 border-ink shadow-brutalist-lg bg-paper flex flex-col">
      <div className="relative">
        <ProductImage src={product.image} alt={product.name} />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-tomato text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
            {product.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-sun text-ink text-[9px] font-black uppercase px-2 py-1">
          -{savings}%
        </span>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-serif font-black text-2xl uppercase italic tracking-tighter">{product.name}</h3>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{product.desc}</p>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="font-black text-3xl text-ink">{product.newPrice.toFixed(2)}€</span>
          <span className="text-sm line-through opacity-40">{product.oldPrice.toFixed(2)}€</span>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Farbe</p>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.name)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 border-2 transition-all ${selectedColor === c.name ? 'border-tomato scale-110' : 'border-ink'}`}
              />
            ))}
          </div>
        </div>

        {product.hasSizes && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Größe</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-ink transition-all
                    ${selectedSize === s ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-auto">
          <div className="flex items-center border-2 border-ink">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-sun transition-all">
              <Minus size={14} />
            </button>
            <span className="px-4 py-2 font-black text-sm border-x-2 border-ink">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-sun transition-all">
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-brutalist transition-all active:translate-x-1 active:translate-y-1 active:shadow-none
              ${added ? 'bg-olive text-white' : 'bg-ink text-white hover:bg-tomato'}`}
          >
            <ShoppingBag size={16} />
            {added ? 'Hinzugefügt!' : 'In den Warenkorb'}
          </button>
        </div>
      </div>
    </div>
  );
}
