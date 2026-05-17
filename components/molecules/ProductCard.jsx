'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import ProductImage from '@/components/atoms/ProductImage';
import { useCartStore, FREE_PRINT_TYPES, getTieredPrice } from '@/store/cartStore';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MIN_QTY = 10;

const PRINT_OPTIONS = [
  { value: 'none',             label: 'Kein Druck',                  price: 0, minQty: 0   },
  { value: 'front',            label: 'DTF Vorderdruck',             price: 5, minQty: 0   },
  { value: 'back',             label: 'DTF Rückendruck',             price: 5, minQty: 0   },
  { value: 'both',             label: 'DTF Vorder- & Rückendruck',   price: 8, minQty: 0   },
  { value: 'siebdruck',        label: 'Siebdruck (ab 150 Stk)',      price: 3, minQty: 150 },
  { value: 'bestickung_front', label: 'Bestickung Vorne',            price: 2, minQty: 0   },
  { value: 'bestickung_back',  label: 'Bestickung Hinten',           price: 3, minQty: 0   },
  { value: 'bestickung_both',  label: 'Bestickung Vorne + Hinten',   price: 5, minQty: 0   },
];

export default function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [sizeQtys, setSizeQtys] = useState(
    product.hasSizes
      ? Object.fromEntries(SIZES.map(s => [s, 0]))
      : { '-': MIN_QTY }
  );
  const [printType, setPrintType] = useState('none');
  const [selectedFabric, setSelectedFabric] = useState(
    product.fabricOptions ? product.fabricOptions[0].value : null
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const totalQty = Object.values(sizeQtys).reduce((a, b) => a + b, 0);
  const isValid = totalQty >= MIN_QTY;

  useEffect(() => {
    if (printType === 'siebdruck' && totalQty < 150) {
      setPrintType('none');
    }
  }, [totalQty]);

  const isBestickung = (v) => v === 'bestickung_front' || v === 'bestickung_back' || v === 'bestickung_both';

  // tshirt: DTF+Siebdruck, kein Bestickung
  // sweat/fleece: alles
  // cap/apron/latz: kein Rücken, kein Bestickung Hinten
  // Siebdruck ist immer sichtbar, aber disabled wenn qty < 150
  const availablePrints = (() => {
    const id = product.id;
    if (id === 'tshirt') return PRINT_OPTIONS.filter(o => !isBestickung(o.value));
    if (id === 'sweat' || id === 'fleece') return PRINT_OPTIONS;
    return PRINT_OPTIONS.filter(o => o.value !== 'back' && o.value !== 'both' && o.value !== 'bestickung_back' && o.value !== 'bestickung_both');
  })();
  const selectedPrint = PRINT_OPTIONS.find(o => o.value === printType);
  const isOptFree = (opt) => FREE_PRINT_TYPES.includes(opt.value) || (opt.value === 'siebdruck' && product.id === 'tshirt');
  const isFree = isOptFree(selectedPrint);
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
    addItem(product, selectedColor, activeSizes, totalQty, printType, selectedFabric);
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
      <Link href={`/produkte/${product.id}`} className="relative block group/img">
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
            <p className="text-[9px] opacity-50">
              ab <span className="font-black">{product.tiers[product.tiers.length - 1].price.toFixed(0)}€</span>
            </p>
          )}
          {product.tiers && (
            <div className="border-t border-ink/20 pt-2 mt-1">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1.5">
                {isBestickung(printType) ? 'Staffelpreise zzgl. Bestickung'
                  : printType === 'siebdruck' ? 'Staffelpreise zzgl. Siebdruck'
                  : printType === 'none' ? 'Staffelpreise (ohne Druck)'
                  : 'Staffelpreise inkl. DTF-Druck'}
              </p>
              <div className="grid grid-cols-5 gap-x-1 gap-y-0.5">
                {product.tiers.slice(0, -1).map((tier, i, arr) => {
                  const isLastVisible = i === arr.length - 1;
                  const isActive = totalQty === 0
                    ? i === 0
                    : totalQty >= tier.minQty && (isLastVisible || totalQty < product.tiers[i + 1].minQty);
                  return (
                    <div key={tier.minQty} className={`flex flex-col text-[9px] px-1 py-0.5 ${isActive ? 'bg-sun' : 'opacity-50'}`}>
                      <span className="whitespace-nowrap">{isLastVisible ? `${tier.minQty}-100` : `${tier.minQty}`} Stk</span>
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

        {/* Teslimat süresi */}
        {product.deliveryTime && (
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
            <span className="opacity-50">Lieferzeit:</span>
            <span className={`px-2 py-0.5 ${product.deliveryTime.startsWith('1') ? 'bg-olive text-white' : 'bg-sun text-ink'}`}>
              {product.deliveryTime}
            </span>
          </div>
        )}

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

        {/* Kumaş Seçimi — Dropdown */}
        {product.fabricOptions && (() => {
          const selected = product.fabricOptions.find(o => o.value === selectedFabric);
          return (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Stoffqualität</p>
              <div className="relative">
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full border-2 border-ink bg-paper px-2 py-2 text-[9px] font-black uppercase appearance-none cursor-pointer focus:outline-none focus:bg-sun pr-6"
                >
                  {product.fabricOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} – {opt.sublabel} ({opt.weight})
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none font-black text-[9px]">▾</span>
              </div>
              {selected?.careNote && (
                <p className="text-[8px] font-bold mt-1 bg-sun text-ink px-2 py-1">{selected.careNote}</p>
              )}
            </div>
          );
        })()}

        {/* Baskı — Dropdown */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Druckoption</p>
          <div className="relative">
            <select
              value={printType}
              onChange={(e) => setPrintType(e.target.value)}
              className="w-full border-2 border-ink bg-paper px-3 py-3 text-[10px] font-black uppercase appearance-none cursor-pointer focus:outline-none focus:bg-sun pr-8 tracking-widest"
            >
              {availablePrints.map((opt) => {
                const locked = totalQty < opt.minQty;
                const suffix = locked
                  ? ` — ab ${opt.minQty} Stk`
                  : isOptFree(opt)
                    ? (opt.price === 0 ? ' — Kostenlos' : ' — GRATIS')
                    : ` — +${opt.price.toFixed(2)}€/Stk`;
                return (
                  <option key={opt.value} value={opt.value} disabled={locked}>
                    {opt.label}{suffix}
                  </option>
                );
              })}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none font-black text-[10px]">▾</span>
          </div>
          {selectedPrint && selectedPrint.value !== 'none' && (
            <div className="mt-2 flex items-center justify-between px-3 py-2 border border-ink/20 bg-white text-[9px] font-black uppercase">
              <span className="opacity-60">{selectedPrint.label}</span>
              {isOptFree(selectedPrint) ? (
                <span className="flex items-center gap-1.5">
                  {selectedPrint.price > 0 && <span className="line-through opacity-40">+{selectedPrint.price.toFixed(2)}€</span>}
                  <span className="bg-olive text-white px-1.5 py-0.5">GRATIS</span>
                </span>
              ) : (
                <span className="text-tomato">+{selectedPrint.price.toFixed(2)}€ / Stk</span>
              )}
            </div>
          )}
        </div>

        {/* Baskı boyut notu */}
        {printType !== 'none' && !isBestickung(printType) && (
          <div className="text-[8px] leading-relaxed bg-sun/50 border border-ink/20 px-3 py-2 space-y-1">
            <p className="font-black uppercase tracking-widest">Standardmaße</p>
            <p>Brust: <strong>10×10 cm</strong> · Rücken: <strong>max. 24 cm Breite</strong></p>
            <p className="opacity-70">Abweichende Maße? Bitte im Bestellformular als Notiz angeben.</p>
            {printType !== 'siebdruck' && (
              <p className="opacity-60 border-t border-ink/10 pt-1">
                DTF-Druck: Hohe Waschbeständigkeit. Nach ca. 20+ Wäschen kann die Farbintensität leicht nachlassen — Richtlinie der Technik.
              </p>
            )}
            {printType === 'siebdruck' && (
              <p className="opacity-60 border-t border-ink/10 pt-1">
                Siebdruck: Langlebig & industriewaschfest. Voraussetzt mind. 100 Stk. pro Farbstoff.
              </p>
            )}
          </div>
        )}

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
