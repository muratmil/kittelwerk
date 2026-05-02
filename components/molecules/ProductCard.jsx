'use client';
import { useState } from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import ProductImage from '@/components/atoms/ProductImage';
import { useCartStore, PRINT_PROMO_ACTIVE } from '@/store/cartStore';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MIN_QTY = 10;

const PRINT_OPTIONS = [
  { value: 'none',  label: 'Kein Druck',            price: 0 },
  { value: 'front', label: 'Vorderdruck',            price: 5 },
  { value: 'back',  label: 'Rückendruck',            price: 5 },
  { value: 'both',  label: 'Vorder- + Rückendruck',  price: 8 },
];

export default function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedSize, setSelectedSize] = useState(product.hasSizes ? 'M' : '-');
  const [qty, setQty] = useState(MIN_QTY);
  const [printType, setPrintType] = useState('none');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const availablePrints = product.hasBackPrint
    ? PRINT_OPTIONS
    : PRINT_OPTIONS.filter(o => o.value !== 'back' && o.value !== 'both');
  const selectedPrint = PRINT_OPTIONS.find(o => o.value === printType);
  const effectivePrintPrice = PRINT_PROMO_ACTIVE ? 0 : selectedPrint.price;
  const totalUnitPrice = product.newPrice + effectivePrintPrice;
  const savings = ((product.oldPrice - product.newPrice) / product.oldPrice * 100).toFixed(0);

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize, qty, printType);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

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

        {/* Fiyat */}
        <div className="border-2 border-ink p-3 bg-white space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="font-black text-2xl text-ink">{product.newPrice.toFixed(2)}€</span>
            <span className="text-sm line-through opacity-40">{product.oldPrice.toFixed(2)}€</span>
            <span className="text-[9px] font-black uppercase opacity-60">/ Stück</span>
          </div>
          {selectedPrint.price > 0 && (
            <div className="flex items-center justify-between text-[10px] font-bold uppercase border-t border-ink/20 pt-1">
              <span className="opacity-60">{selectedPrint.label}</span>
              {PRINT_PROMO_ACTIVE ? (
                <span className="flex items-center gap-1.5">
                  <span className="line-through opacity-40">+{selectedPrint.price.toFixed(2)}€</span>
                  <span className="bg-olive text-white font-black px-1 py-0.5 text-[8px]">GRATIS</span>
                </span>
              ) : (
                <span className="text-tomato">+{selectedPrint.price.toFixed(2)}€ / Stück</span>
              )}
            </div>
          )}
          {selectedPrint.price > 0 && !PRINT_PROMO_ACTIVE && (
            <div className="flex items-center justify-between text-[11px] font-black uppercase border-t-2 border-ink pt-1">
              <span>Gesamt / Stück</span>
              <span>{totalUnitPrice.toFixed(2)}€</span>
            </div>
          )}
        </div>

        {/* Renk */}
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

        {/* Beden */}
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

        {/* Baskı */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Druckoption</p>
          <div className="grid grid-cols-2 gap-2">
            {availablePrints.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPrintType(opt.value)}
                className={`px-2 py-2 text-[9px] font-black uppercase border-2 border-ink transition-all text-left leading-tight
                  ${printType === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}
              >
                {opt.label}
                {opt.price === 0 ? (
                  <span className="block text-[8px] font-bold mt-0.5 opacity-70">Kostenlos</span>
                ) : PRINT_PROMO_ACTIVE ? (
                  <span className="block mt-0.5 flex items-center gap-1">
                    <span className={`text-[8px] font-bold line-through ${printType === opt.value ? 'opacity-40' : 'opacity-40'}`}>+{opt.price.toFixed(2)}€</span>
                    <span className="text-[8px] font-black bg-olive text-white px-1">GRATIS</span>
                  </span>
                ) : (
                  <span className={`block text-[8px] font-bold mt-0.5 ${printType === opt.value ? 'opacity-70' : 'text-tomato'}`}>
                    +{opt.price.toFixed(2)}€
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Adet */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">
            Menge <span className="text-tomato">(Min. {MIN_QTY} Stück)</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-ink">
              <button onClick={() => setQty(q => Math.max(MIN_QTY, q - 1))} className="px-3 py-2 hover:bg-sun transition-all">
                <Minus size={14} />
              </button>
              <span className="px-4 py-2 font-black text-sm border-x-2 border-ink min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-sun transition-all">
                <Plus size={14} />
              </button>
            </div>
            <span className="text-[10px] font-black opacity-50 uppercase">= {(totalUnitPrice * qty).toFixed(2)}€</span>
          </div>
        </div>

        {/* Sepete ekle */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-4 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-brutalist transition-all active:translate-x-1 active:translate-y-1 active:shadow-none mt-auto
            ${added ? 'bg-olive text-white' : 'bg-ink text-white hover:bg-tomato'}`}
        >
          <ShoppingBag size={16} />
          {added ? 'Hinzugefügt!' : 'In den Warenkorb'}
        </button>
      </div>
    </div>
  );
}
