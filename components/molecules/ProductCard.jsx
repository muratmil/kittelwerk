'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import ProductImage from '@/components/atoms/ProductImage';
import { useCartStore, FREE_PRINT_TYPES, getTieredPrice } from '@/store/cartStore';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MIN_QTY = 10;

const PRINT_OPTIONS = [
  { value: 'none',       label: 'Kein Druck',           price: 0 },
  { value: 'front',      label: 'Vorderdruck',           price: 5 },
  { value: 'back',       label: 'Rückendruck',           price: 5 },
  { value: 'both',       label: 'Vorder- + Rückendruck', price: 8 },
  { value: 'bestickung', label: 'Bestickung',            price: 0 },
];

export default function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [sizeQtys, setSizeQtys] = useState(
    product.hasSizes
      ? Object.fromEntries(SIZES.map(s => [s, 0]))
      : { '-': MIN_QTY }
  );
  const [printType, setPrintType] = useState(product.bestickungOnly ? 'bestickung' : 'none');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const totalQty = Object.values(sizeQtys).reduce((a, b) => a + b, 0);
  const isValid = totalQty >= MIN_QTY;

  const availablePrints = product.bestickungOnly
    ? PRINT_OPTIONS.filter(o => o.value === 'bestickung')
    : product.hasBackPrint
      ? PRINT_OPTIONS.filter(o => o.value !== 'bestickung')
      : PRINT_OPTIONS.filter(o => o.value !== 'back' && o.value !== 'both' && o.value !== 'bestickung');
  const selectedPrint = PRINT_OPTIONS.find(o => o.value === printType);
  const isFree = FREE_PRINT_TYPES.includes(printType);
  const effectivePrintPrice = isFree ? 0 : selectedPrint.price;
  const basePrice = getTieredPrice(product, totalQty);
  const totalUnitPrice = basePrice + effectivePrintPrice;
  const savings = ((product.oldPrice - basePrice) / product.oldPrice * 100).toFixed(0);

  const updateSize = (size, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setSizeQtys(prev => ({ ...prev, [size]: num }));
  };

  const handleAddToCart = () => {
    if (!isValid) return;
    const activeSizes = Object.fromEntries(Object.entries(sizeQtys).filter(([, v]) => v > 0));
    addItem(product, selectedColor, activeSizes, totalQty, printType);
    setAdded(true);
    setSizeQtys(
      product.hasSizes
        ? Object.fromEntries(SIZES.map(s => [s, 0]))
        : { '-': MIN_QTY }
    );
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="border-4 border-ink shadow-brutalist-lg bg-paper flex flex-col">
      <Link href={`/urunler/${product.id}`} className="relative block group/img">
        <ProductImage src={product.image} alt={product.name} />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-tomato text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
            {product.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-sun text-ink text-[9px] font-black uppercase px-2 py-1">
          -{savings}%
        </span>
        <span className="absolute inset-0 bg-ink/0 group-hover/img:bg-ink/10 transition-all flex items-center justify-center">
          <span className="opacity-0 group-hover/img:opacity-100 bg-ink text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all">
            Details anzeigen →
          </span>
        </span>
      </Link>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-serif font-black text-2xl uppercase italic tracking-tighter">{product.name}</h3>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{product.desc}</p>
        </div>

        {/* Fiyat */}
        <div className="border-2 border-ink p-3 bg-white space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="font-black text-2xl text-ink">{basePrice.toFixed(2)}€</span>
            <span className="text-sm line-through opacity-40">{product.oldPrice.toFixed(2)}€</span>
            <span className="text-[9px] font-black uppercase opacity-60">/ Stück</span>
          </div>
          {product.tiers && (
            <div className="border-t border-ink/20 pt-2 mt-1">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1.5">{product.bestickungOnly ? 'Staffelpreise inkl. Bestickung' : 'Staffelpreise inkl. Druck'}</p>
              <div className="grid grid-cols-6 gap-x-1 gap-y-0.5">
                {product.tiers.map((tier, i) => {
                  const isActive = totalQty === 0
                    ? i === 0
                    : totalQty >= tier.minQty && (i === product.tiers.length - 1 || totalQty < product.tiers[i + 1].minQty);
                  return (
                    <div key={tier.minQty} className={`flex flex-col text-[9px] px-1 py-0.5 ${isActive ? 'bg-sun' : 'opacity-50'}`}>
                      <span className="whitespace-nowrap">{tier.minQty === 100 ? '100+' : `${tier.minQty}`} Stk</span>
                      <span className="font-black">{tier.price.toFixed(2)}€</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {selectedPrint.price > 0 && (
            <div className="flex items-center justify-between text-[10px] font-bold uppercase border-t border-ink/20 pt-1">
              <span className="opacity-60">{selectedPrint.label}</span>
              {isFree ? (
                <span className="flex items-center gap-1.5">
                  <span className="line-through opacity-40">+{selectedPrint.price.toFixed(2)}€</span>
                  <span className="bg-olive text-white font-black px-1 py-0.5 text-[8px]">GRATIS</span>
                </span>
              ) : (
                <span className="text-tomato">+{selectedPrint.price.toFixed(2)}€ / Stück</span>
              )}
            </div>
          )}
          {selectedPrint.price > 0 && !isFree && (
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
              <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 border-2 transition-all ${selectedColor === c.name ? 'border-tomato scale-110' : 'border-ink'}`}
              />
            ))}
          </div>
        </div>

        {/* Baskı */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">{product.bestickungOnly ? 'Veredelung' : 'Druckoption'}</p>
          <div className="grid grid-cols-2 gap-2">
            {availablePrints.map((opt) => (
              <button key={opt.value} onClick={() => setPrintType(opt.value)}
                className={`px-2 py-2 text-[9px] font-black uppercase border-2 border-ink transition-all text-left leading-tight
                  ${printType === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
                {opt.label}
                {opt.price === 0 || FREE_PRINT_TYPES.includes(opt.value) ? (
                  opt.price === 0 ? (
                    <span className="block text-[8px] font-bold mt-0.5 opacity-70">Kostenlos</span>
                  ) : (
                    <span className="block mt-0.5 flex items-center gap-1">
                      <span className="text-[8px] font-bold line-through opacity-40">+{opt.price.toFixed(2)}€</span>
                      <span className="text-[8px] font-black bg-olive text-white px-1">GRATIS</span>
                    </span>
                  )
                ) : (
                  <span className={`block text-[8px] font-bold mt-0.5 ${printType === opt.value ? 'opacity-70' : 'text-tomato'}`}>
                    +{opt.price.toFixed(2)}€
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Beden & Adet */}
        {product.hasSizes ? (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60">
              Größe & Menge{' '}
              <span className={totalQty >= MIN_QTY ? 'text-olive' : 'text-tomato'}>
                (Gesamt: {totalQty} / Min. {MIN_QTY})
              </span>
            </p>
            <div className="space-y-2">
              {SIZES.map(size => (
                <div key={size} className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase w-8 flex-shrink-0">{size}</span>
                  <div className="flex items-center border-2 border-ink">
                    <button onClick={() => updateSize(size, sizeQtys[size] - 1)}
                      className="px-2 py-1.5 hover:bg-sun transition-all">
                      <Minus size={12} />
                    </button>
                    <input
                      type="number" min="0" value={sizeQtys[size]}
                      onChange={(e) => updateSize(size, e.target.value)}
                      className="w-10 py-1.5 font-black text-sm border-x-2 border-ink text-center outline-none bg-transparent"
                    />
                    <button onClick={() => updateSize(size, sizeQtys[size] + 1)}
                      className="px-2 py-1.5 hover:bg-sun transition-all">
                      <Plus size={12} />
                    </button>
                  </div>
                  {sizeQtys[size] > 0 && (
                    <span className="text-[10px] opacity-50">
                      = {(totalUnitPrice * sizeQtys[size]).toFixed(2)}€
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">
              Menge <span className="text-tomato">(Min. {MIN_QTY} Stück)</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-ink">
                <button onClick={() => updateSize('-', sizeQtys['-'] - 1)}
                  className="px-3 py-2 hover:bg-sun transition-all">
                  <Minus size={14} />
                </button>
                <input
                  type="number" min={MIN_QTY} value={sizeQtys['-']}
                  onChange={(e) => updateSize('-', Math.max(MIN_QTY, parseInt(e.target.value) || MIN_QTY))}
                  className="px-2 py-2 font-black text-sm border-x-2 border-ink w-16 text-center outline-none bg-transparent"
                />
                <button onClick={() => updateSize('-', sizeQtys['-'] + 1)}
                  className="px-3 py-2 hover:bg-sun transition-all">
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-[10px] font-black opacity-50 uppercase">
                = {(totalUnitPrice * sizeQtys['-']).toFixed(2)}€
              </span>
            </div>
          </div>
        )}

        {/* Sepete ekle */}
        <button onClick={handleAddToCart} disabled={!isValid}
          className={`w-full py-4 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-brutalist transition-all mt-auto
            ${added ? 'bg-olive text-white' : isValid ? 'bg-ink text-white hover:bg-tomato active:translate-x-1 active:translate-y-1 active:shadow-none' : 'bg-ink/30 text-white/50 cursor-not-allowed'}`}>
          <ShoppingBag size={16} />
          {added ? 'Hinzugefügt!' : isValid ? 'In den Warenkorb' : `Min. ${MIN_QTY} Stück wählen`}
        </button>
      </div>
    </div>
  );
}
