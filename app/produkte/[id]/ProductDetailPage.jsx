'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductGallery from '@/components/atoms/ProductGallery';
import SizeChart from '@/components/molecules/SizeChart';
import { useCartStore, FREE_PRINT_TYPES, getTieredPrice } from '@/store/cartStore';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MIN_QTY = 10;

const PRINT_OPTIONS = [
  { value: 'none',       label: 'Kein Druck',           desc: 'Ohne Bedruckung',            price: 0 },
  { value: 'front',      label: 'Vorderdruck',           desc: 'Logo / Motiv vorne',         price: 5 },
  { value: 'back',       label: 'Rückendruck',           desc: 'Logo / Motiv hinten',        price: 5 },
  { value: 'both',       label: 'Vorder- & Rückendruck', desc: 'Vorne und hinten bedruckt',  price: 8 },
  { value: 'bestickung', label: 'Bestickung',            desc: 'Gesticktes Logo / Schrift',  price: 0 },
];

export default function ProductDetailPage({ product }) {
  const minQty = product.minQty || MIN_QTY;
  const sizes = product.sizes || SIZES;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [sizeQtys, setSizeQtys] = useState(
    product.hasSizes
      ? Object.fromEntries(sizes.map(s => [s, 0]))
      : { '-': minQty }
  );
  const [printType, setPrintType] = useState(product.bestickungOnly ? 'bestickung' : 'none');
  const [selectedFabric, setSelectedFabric] = useState(
    product.fabricOptions ? product.fabricOptions[0].value : null
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Bald Hier — ürün henüz satista degil: fiyat/sepet yok, bilgi + WhatsApp CTA
  if (product.comingSoon) {
    return (
      <main className="min-h-screen bg-paper">
        <AlertBar />
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">
            <Link href="/" className="hover:text-tomato transition-colors">Kittelwerk</Link>
            <span>/</span>
            <Link href="/produkte" className="hover:text-tomato transition-colors">Produkte</Link>
            <span>/</span>
            <span className="text-ink opacity-100">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative">
                <ProductGallery product={product} />
                <span className="absolute top-4 left-4 bg-ink text-sun text-[9px] font-black uppercase tracking-widest px-3 py-1.5 z-10">
                  Bald hier
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-serif font-black text-4xl md:text-5xl uppercase italic tracking-tighter leading-none">
                  {product.name}
                </h1>
                <p className="text-[11px] uppercase tracking-widest opacity-60 mt-2">{product.desc}</p>
              </div>

              {product.longDesc && (
                <p className="text-sm leading-relaxed opacity-75 border-l-4 border-tomato pl-4">
                  {product.longDesc}
                </p>
              )}

              <div className="border-4 border-ink bg-white p-5 shadow-brutalist">
                <p className="font-black text-2xl text-ink/60 uppercase tracking-widest">Preis in Kürze</p>
                <p className="text-[10px] opacity-60 mt-1">Dieses Produkt ist bald bei uns bestellbar — natürlich mit kostenlosem Logo-Druck bzw. Bestickung ab 10 Stück.</p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60">Geplante Farben</p>
                <div className="flex gap-3">
                  {product.colors.map((c) => (
                    <span key={c.name} title={c.name} style={{ backgroundColor: c.hex }}
                      className="w-9 h-9 border-2 border-ink" />
                  ))}
                </div>
              </div>

              {product.hasSizes && product.sizeChart && (
                <SizeChart sizes={sizes} chart={product.sizeChart} />
              )}

              <a
                href={`https://wa.me/491749623344?text=${encodeURIComponent(`Hallo! Ich interessiere mich für das Produkt "${product.name}" (bald verfügbar). Bitte informieren Sie mich, sobald es bestellbar ist.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-brutalist transition-all bg-olive text-white hover:bg-ink active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Bei Verfügbarkeit benachrichtigen
              </a>

              {product.details && (
                <div className="border-4 border-ink p-5 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">Produktdetails</p>
                  <ul className="space-y-2">
                    {product.details.map((item, i) => {
                      const [label, ...rest] = item.split(':');
                      return (
                        <li key={i} className="flex gap-2 text-[11px] leading-relaxed">
                          <span className="text-tomato font-black mt-0.5 flex-shrink-0">—</span>
                          <span>
                            <strong className="font-black">{label}:</strong>
                            {rest.join(':')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {product.washing && (
                <div className="border-4 border-ink p-5 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">Pflegehinweise</p>
                  <div className="grid grid-cols-1 gap-2">
                    {product.washing.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-[11px]">
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href="/produkte"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-tomato transition-all w-fit">
                <ArrowLeft size={14} />
                Zurück zu allen Produkten
              </Link>
            </div>
          </div>
        </div>
        <Footer />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </main>
    );
  }

  const totalQty = Object.values(sizeQtys).reduce((a, b) => a + b, 0);
  const isValid = totalQty >= minQty;

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
    addItem(product, selectedColor, activeSizes, totalQty, printType, selectedFabric);
    setAdded(true);
    setSizeQtys(
      product.hasSizes
        ? Object.fromEntries(sizes.map(s => [s, 0]))
        : { '-': minQty }
    );
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-paper">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <div className="container mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">
          <Link href="/" className="hover:text-tomato transition-colors">Kittelwerk</Link>
          <span>/</span>
          <Link href="/produkte" className="hover:text-tomato transition-colors">Produkte</Link>
          <span>/</span>
          <span className="text-ink opacity-100">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Sol — Görsel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative">
              <ProductGallery product={product} />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-tomato text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 z-10">
                  {product.badge}
                </span>
              )}
              <span className="absolute top-4 right-4 bg-sun text-ink text-[9px] font-black uppercase px-3 py-1.5 z-10">
                -{savings}%
              </span>
            </div>
          </div>

          {/* Sağ — Detaylar */}
          <div className="flex flex-col gap-6">

            {/* Başlık */}
            <div>
              <h1 className="font-serif font-black text-4xl md:text-5xl uppercase italic tracking-tighter leading-none">
                {product.name}
              </h1>
              <p className="text-[11px] uppercase tracking-widest opacity-60 mt-2">{product.desc}</p>
            </div>

            {/* Ürün Açıklaması */}
            {product.longDesc && (
              <p className="text-sm leading-relaxed opacity-75 border-l-4 border-tomato pl-4">
                {product.longDesc}
              </p>
            )}

            {/* Fiyat */}
            <div className="border-4 border-ink bg-white p-5 shadow-brutalist">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-black text-4xl text-ink">{basePrice.toFixed(2)}€</span>
                <span className="text-base line-through opacity-40">{product.oldPrice.toFixed(2)}€</span>
                <span className="text-[9px] font-black uppercase opacity-60">/ Stück</span>
                <span className="ml-auto bg-tomato text-white text-[9px] font-black px-2 py-1">-{savings}%</span>
              </div>

              <div className="border-t-2 border-ink/20 pt-3">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-2">
                  {product.bestickungOnly ? 'Staffelpreise inkl. Bestickung' : 'Staffelpreise inkl. Logo-Druck'}
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {product.tiers.map((tier, i) => {
                    const isActive = totalQty === 0
                      ? i === 0
                      : totalQty >= tier.minQty && (i === product.tiers.length - 1 || totalQty < product.tiers[i + 1].minQty);
                    return (
                      <div key={tier.minQty} className={`flex flex-col text-[9px] px-2 py-1.5 border-2 ${isActive ? 'border-ink bg-sun font-black' : 'border-ink/20 opacity-50'}`}>
                        <span className="whitespace-nowrap">{tier.minQty === 100 ? '100+' : `${tier.minQty}`} Stk</span>
                        <span className="font-black text-[10px]">{tier.price.toFixed(2)}€</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedPrint?.price > 0 && (
                <div className="border-t border-ink/20 mt-3 pt-2 flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className="opacity-60">{selectedPrint.label}</span>
                  {isFree ? (
                    <span className="flex items-center gap-1.5">
                      <span className="line-through opacity-40">+{selectedPrint.price.toFixed(2)}€</span>
                      <span className="bg-olive text-white font-black px-1.5 py-0.5 text-[8px]">GRATIS</span>
                    </span>
                  ) : (
                    <span className="text-tomato">+{selectedPrint.price.toFixed(2)}€ / Stück</span>
                  )}
                </div>
              )}
            </div>

            {/* Teslimat süresi */}
            {product.deliveryTime && (
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border-2 border-ink px-4 py-2.5">
                <span className="opacity-50">Lieferzeit:</span>
                <span className={`px-2 py-0.5 ${product.deliveryTime.startsWith('1') ? 'bg-olive text-white' : 'bg-sun text-ink'}`}>
                  {product.deliveryTime}
                </span>
                <span className="opacity-40 normal-case font-medium text-[9px]">ab Zahlungseingang</span>
              </div>
            )}

            {/* Renk */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60">
                Farbe — <span className="text-ink opacity-100">{selectedColor}</span>
              </p>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                    style={{ backgroundColor: c.hex }}
                    className={`w-9 h-9 border-2 transition-all flex items-center justify-center ${selectedColor === c.name ? 'border-tomato scale-110' : 'border-ink'}`}>
                    {selectedColor === c.name && <Check size={14} className="text-white drop-shadow" />}
                  </button>
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
                      className="w-full border-2 border-ink bg-paper px-3 py-3 text-[11px] font-black uppercase appearance-none cursor-pointer focus:outline-none focus:bg-sun pr-8"
                    >
                      {product.fabricOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} – {opt.sublabel} ({opt.weight})
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none font-black text-[10px]">▾</span>
                  </div>
                  {selected && (
                    <div className="border-2 border-ink border-t-0 bg-white px-3 py-2">
                      <p className="text-[10px] opacity-60 leading-snug">{selected.desc}</p>
                      {selected.careNote && (
                        <p className="text-[9px] font-black mt-1.5 bg-sun text-ink px-2 py-1">{selected.careNote}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Baskı / Bestickung */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60">
                {product.bestickungOnly ? 'Veredelung' : 'Druckoption'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availablePrints.map((opt) => (
                  <button key={opt.value} onClick={() => setPrintType(opt.value)}
                    className={`px-3 py-3 text-left border-2 border-ink transition-all
                      ${printType === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
                    <span className="block text-[10px] font-black uppercase">{opt.label}</span>
                    <span className={`block text-[9px] mt-0.5 ${printType === opt.value ? 'opacity-60' : 'opacity-50'}`}>{opt.desc}</span>
                    {FREE_PRINT_TYPES.includes(opt.value) ? (
                      opt.price === 0
                        ? <span className="block text-[8px] font-bold mt-1 text-olive">Kostenlos</span>
                        : <span className="block text-[8px] font-black mt-1 text-olive">GRATIS</span>
                    ) : (
                      <span className={`block text-[8px] font-bold mt-1 ${printType === opt.value ? 'opacity-60' : 'text-tomato'}`}>
                        +{opt.price.toFixed(2)}€ / Stück
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
                  <span className={totalQty >= minQty ? 'text-olive' : 'text-tomato'}>
                    (Gesamt: {totalQty} / Min. {minQty})
                  </span>
                </p>
                <div className="space-y-2">
                  {sizes.map(size => (
                    <div key={size} className="flex items-center gap-4">
                      <span className="text-[11px] font-black uppercase w-10 flex-shrink-0">{size}</span>
                      <div className="flex items-center border-2 border-ink">
                        <button onClick={() => updateSize(size, sizeQtys[size] - 1)}
                          className="px-3 py-2 hover:bg-sun transition-all">
                          <Minus size={13} />
                        </button>
                        <input
                          type="number" min="0" value={sizeQtys[size]}
                          onChange={(e) => updateSize(size, e.target.value)}
                          className="w-12 py-2 font-black text-sm border-x-2 border-ink text-center outline-none bg-transparent"
                        />
                        <button onClick={() => updateSize(size, sizeQtys[size] + 1)}
                          className="px-3 py-2 hover:bg-sun transition-all">
                          <Plus size={13} />
                        </button>
                      </div>
                      {sizeQtys[size] > 0 && (
                        <span className="text-[10px] font-black opacity-50">
                          = {(totalUnitPrice * sizeQtys[size]).toFixed(2)}€
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60">
                  Menge <span className="text-tomato">(Min. {minQty} Stück)</span>
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-ink">
                    <button onClick={() => updateSize('-', sizeQtys['-'] - 1)}
                      className="px-4 py-2.5 hover:bg-sun transition-all">
                      <Minus size={14} />
                    </button>
                    <input
                      type="number" min={minQty} value={sizeQtys['-']}
                      onChange={(e) => updateSize('-', Math.max(minQty, parseInt(e.target.value) || minQty))}
                      className="px-3 py-2.5 font-black text-sm border-x-2 border-ink w-20 text-center outline-none bg-transparent"
                    />
                    <button onClick={() => updateSize('-', sizeQtys['-'] + 1)}
                      className="px-4 py-2.5 hover:bg-sun transition-all">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[11px] font-black opacity-50 uppercase">
                    = {(totalUnitPrice * sizeQtys['-']).toFixed(2)}€
                  </span>
                </div>
              </div>
            )}

            {/* Ölçü tablosu */}
            {product.hasSizes && product.sizeChart && (
              <SizeChart sizes={sizes} chart={product.sizeChart} />
            )}

            {/* Toplam & Sepete Ekle */}
            {isValid && (
              <div className="border-4 border-ink bg-sun p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-60">Gesamt</p>
                  <p className="font-black text-2xl">{(totalUnitPrice * totalQty).toFixed(2)}€</p>
                  <p className="text-[9px] opacity-60">{totalQty} Stück × {totalUnitPrice.toFixed(2)}€</p>
                </div>
                <button onClick={handleAddToCart}
                  className={`px-8 py-4 font-black text-sm uppercase flex items-center gap-2 shadow-brutalist transition-all
                    ${added ? 'bg-olive text-white' : 'bg-ink text-white hover:bg-tomato active:translate-x-1 active:translate-y-1 active:shadow-none'}`}>
                  <ShoppingBag size={18} />
                  {added ? 'Hinzugefügt!' : 'In den Warenkorb'}
                </button>
              </div>
            )}

            {!isValid && (
              <button disabled
                className="w-full py-4 font-black text-xs uppercase flex items-center justify-center gap-2 bg-ink/20 text-ink/40 cursor-not-allowed border-4 border-ink/20">
                <ShoppingBag size={16} />
                Min. {minQty} Stück wählen
              </button>
            )}

            {/* Ürün Detayları */}
            {(product.details || product.marketingText) && (
              <div className="border-4 border-ink p-5 bg-white">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">Produktdetails</p>
                {product.marketingText && (
                  <p className="text-sm font-medium italic opacity-70 mb-4 pb-4 border-b-2 border-ink/10 leading-relaxed">
                    „{product.marketingText}"
                  </p>
                )}
                {product.details && (
                  <ul className="space-y-2">
                    {product.details.map((item, i) => {
                      const [label, ...rest] = item.split(':');
                      return (
                        <li key={i} className="flex gap-2 text-[11px] leading-relaxed">
                          <span className="text-tomato font-black mt-0.5 flex-shrink-0">—</span>
                          <span>
                            <strong className="font-black">{label}:</strong>
                            {rest.join(':')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Yıkama Talimatları */}
            {product.washing && (
              <div className="border-4 border-ink p-5 bg-white">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">Pflegehinweise</p>
                <div className="grid grid-cols-1 gap-2">
                  {product.washing.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-[11px]">
                      <span className="text-[16px] flex-shrink-0 leading-none">
                        {item.includes('Maschinenwäsche') || item.includes('Handwäsche') ? '🧺' :
                         item.includes('bleichen') ? '🚫' :
                         item.includes('Trockner') ? '💨' :
                         item.includes('Bügeln') || item.includes('bügeln') ? '🌡️' :
                         item.includes('chemisch') ? '⚗️' :
                         item.includes('links waschen') ? '⚠️' :
                         item.includes('Form') ? '👐' : '•'}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Güven & Geri */}
            <div className="border-2 border-ink/20 p-4 bg-white grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="w-8 h-8 bg-ink text-white flex items-center justify-center text-[8px] font-black mb-1 mx-auto border-2 border-ink">LOGO</div>
                <p className="text-[9px] font-black uppercase">Logo-Druck kostenlos</p>
              </div>
              <div>
                <p className="text-[18px] mb-1">📦</p>
                <p className="text-[9px] font-black uppercase">Ab 10 Stück</p>
              </div>
              <div className="hidden">
                <p className="text-[9px] font-black uppercase">Logo per Mail</p>
              </div>
            </div>

            <Link href="/produkte"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-tomato transition-all w-fit">
              <ArrowLeft size={14} />
              Zurück zu allen Produkten
            </Link>

          </div>
        </div>
      </div>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
