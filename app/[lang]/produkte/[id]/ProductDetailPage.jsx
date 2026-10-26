'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Minus, ArrowLeft, Check, Truck, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import AlertBar from '@/components/layout/AlertBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProduktSeoBlock from './ProduktSeoBlock';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductGallery from '@/components/atoms/ProductGallery';
import SizeChart from '@/components/molecules/SizeChart';
import PreisModusSchalter from '@/components/atoms/PreisModusSchalter';
import { usePreis } from '@/store/preisStore';
import { MWST_SATZ } from '@/store/cartStore';
import { STANDARD_GROESSEN, groessenAufpreis, hatAufpreis } from '@/lib/groessen';
import { useCartStore, FREE_PRINT_TYPES, getTieredPrice } from '@/store/cartStore';
import { useSprache } from '@/components/i18n/SpracheProvider';
import { pflegeIcon } from '@/lib/pflegeIcon';

const SIZES = STANDARD_GROESSEN;
const MIN_QTY = 10;

// Etiket ve açıklamalar sözlükte: `produkt.druckSeite` / `produkt.druckDesc`.
const PRINT_OPTIONS = [
  { value: 'none',       price: 0 },
  { value: 'front',      price: 5 },
  { value: 'back',       price: 5 },
  { value: 'both',       price: 8 },
  { value: 'bestickung', price: 0 },
];

// Stückpreise ohne ,00 (Murat: keine Cent-Optik), echte Cent bleiben (10.50)
const eur = (n) => (Number.isInteger(n) ? `${n}€` : `${n.toFixed(2)}€`);

// Nummerierter Schritt im Kittelwerk-Stil (schwarzes Quadrat, gelbe Ziffer)
function Schritt({ nr, titel, children }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 bg-ink text-sun font-black text-sm flex items-center justify-center shrink-0">{String(nr).padStart(2, '0')}</span>
        <h2 className="font-black text-lg uppercase tracking-tight">{titel}</h2>
      </div>
      {children}
    </section>
  );
}

export default function ProductDetailPage({ product, seo = null }) {
  const { t, p, f, farbe } = useSprache();
  const { modus, preis } = usePreis();
  const T = t.produkt;
  const L = t.liste;
  const minQty = product.minQty || MIN_QTY;
  const sizes = product.sizes || SIZES;
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Varsayılan renk = KAPAK fotoğrafının rengi (2026-09-22). Yoksa ilk renk.
  // Kapak lacivert bir ceket gösterirken kutucukta siyah seçili durmasın:
  // galeri o zaman seçili renge atlayıp yan görünüşle açılıyordu.
  const kapakFarbe = product.gallery?.find((b) => b.src === product.image)?.farbe;
  const [selectedColor, setSelectedColor] = useState(
    product.colors.some((c) => c.name === kapakFarbe) ? kapakFarbe : product.colors[0].name,
  );
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
  const [tab, setTab] = useState('details');
  const [mehr, setMehr] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Bald Hier — ürün henüz satista degil: fiyat/sepet yok, bilgi + WhatsApp CTA
  if (product.comingSoon) {
    return (
      <main className="min-h-screen bg-paper">
        <AlertBar />
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">
            <Link href={p('/')} className="hover:text-tomato transition-colors">{L.kittelwerk}</Link>
            <span>/</span>
            <Link href={p('/produkte')} className="hover:text-tomato transition-colors">{L.produkte}</Link>
            <span>/</span>
            <span className="text-ink opacity-100">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative">
                <ProductGallery product={product} />
                <span className="absolute top-4 left-4 bg-ink text-sun text-[9px] font-black uppercase tracking-widest px-3 py-1.5 z-10">
                  {T.baldHier}
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
                <p className="font-black text-2xl text-ink/60 uppercase tracking-widest">{T.preisBald}</p>
                <p className="text-[10px] opacity-60 mt-1">{T.preisBaldText}</p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-60">{T.geplanteFarben}</p>
                <div className="flex gap-3">
                  {product.colors.map((c) => (
                    <span key={c.name} title={farbe(c.name)} style={{ backgroundColor: c.hex }}
                      className="w-9 h-9 border-2 border-ink" />
                  ))}
                </div>
              </div>

              {product.hasSizes && product.sizeChart && (
                <SizeChart sizes={sizes} chart={product.sizeChart} />
              )}

              <a
                href={`https://wa.me/491749623344?text=${encodeURIComponent(f(T.whatsappBald, { name: product.name }))}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-brutalist transition-all bg-olive text-white hover:bg-ink active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                {T.benachrichtigen}
              </a>

              {product.details && (
                <div className="border-4 border-ink p-5 bg-white">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">{T.produktdetails}</p>
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
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-4">{T.pflegehinweise}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {product.washing.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-[11px]">
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={p('/produkte')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-tomato transition-all w-fit">
                <ArrowLeft size={14} />
                {T.zurueck}
              </Link>
            </div>
          </div>
        </div>
        <ProduktSeoBlock seo={seo} category={product.category} p={p} />
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
  // Büyük bedenlerin parça farkı toplama ayrıca ekleniyor (sunucu da aynısını yapıyor).
  const aufpreisGesamt = Object.entries(sizeQtys)
    .reduce((s2, [groesse, adet]) => s2 + (adet || 0) * groessenAufpreis(product, groesse), 0);
  const gesamtPreis = totalUnitPrice * totalQty + aufpreisGesamt;
  const hatAltpreis = typeof product.oldPrice === 'number' && product.oldPrice > basePrice;
  const savings = hatAltpreis ? ((product.oldPrice - basePrice) / product.oldPrice * 100).toFixed(0) : null;

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

  let schrittNr = 0;
  const naechster = () => ++schrittNr;
  // Gleiche Preise hintereinander nur einmal zeigen ("ab 50", nicht auch "ab 100") — Murat 2026-10-24
  const tiers = [...(product.tiers || [])].sort((a, b) => a.minQty - b.minQty)
    .filter((x, i, arr) => i === 0 || x.price !== arr[i - 1].price);
  // Kopfpreis = Preis der aktuell gewählten Menge (unter der Mindestmenge: erste Staffel).
  // Kein "ab <günstigste Staffel>": der 100er-Preis ist kein realistischer Einstiegspreis.
  const kopfPreis = tiers.length && totalQty < tiers[0].minQty ? tiers[0].price : basePrice;
  const aufpreisGroessen = sizes.filter((g) => groessenAufpreis(product, g) > 0);
  const tabs = [
    (product.details || product.marketingText) && ['details', T.produktdetails],
    product.washing && ['pflege', T.pflegehinweise],
  ].filter(Boolean);
  const aktiverTab = tabs.some(([k]) => k === tab) ? tab : tabs[0]?.[0];

  return (
    <main className="min-h-screen bg-paper">
      <AlertBar />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <div className="container mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">
          <Link href={p('/')} className="hover:text-tomato transition-colors">{L.kittelwerk}</Link>
          <span>/</span>
          <Link href={p('/produkte')} className="hover:text-tomato transition-colors">{L.produkte}</Link>
          <span>/</span>
          <span className="text-ink opacity-100">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Sol — Görsel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative">
              <ProductGallery product={product} farbe={selectedColor} />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-tomato text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 z-10">
                  {product.badge}
                </span>
              )}
              {hatAltpreis && (
                <span className="absolute top-4 right-4 bg-sun text-ink text-[9px] font-black uppercase px-3 py-1.5 z-10">
                  -{savings}%
                </span>
              )}
            </div>
          </div>

          {/* Sağ — Detaylar: Kopf, Preis, dann nummerierte Schritte */}
          <div className="flex flex-col gap-8">

            <div className="flex flex-col gap-4">
              <div>
                <h1 className="font-serif font-black text-4xl md:text-5xl uppercase italic tracking-tighter leading-none">
                  {product.name}
                </h1>
                <p className="text-[11px] uppercase tracking-widest text-tomato font-black mt-2">{product.desc}</p>
              </div>
              {product.longDesc && (
                <div className="border-l-4 border-tomato pl-4">
                  {/* Auf dem Handy gekürzt, damit die Auswahl schneller erreichbar ist */}
                  <p className={`text-sm leading-relaxed opacity-75 ${mehr ? '' : 'max-lg:line-clamp-4'}`}>{product.longDesc}</p>
                  <button onClick={() => setMehr(!mehr)} className="lg:hidden mt-1 text-[10px] font-black uppercase tracking-widest text-tomato">
                    {mehr ? T.weniger : T.mehrLesen}
                  </button>
                </div>
              )}

              {/* Preis + Staffel */}
              <div>
                {/* Kein durchgestrichener Altpreis neben "ab": oldPrice bezieht sich auf die erste Staffel,
                    neben dem 100er-Preis würde er die Ersparnis übertreiben (-%-Rozette am Bild bleibt) */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-black text-4xl">{eur(preis(kopfPreis))}</span>
                  <PreisModusSchalter />
                </div>
                <p className="text-[10px] font-black uppercase opacity-50 mt-1">
                  {f(T.abStueck, { n: minQty })} · {modus === 'brutto' ? f(t.preisModus.hinweisBrutto, { satz: MWST_SATZ }) : t.preisModus.hinweisNetto}
                </p>
              </div>
              {tiers.length > 0 && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-2">
                    {product.bestickungOnly ? T.staffelInklBestickung : T.staffelInklLogo}
                  </p>
                  <div className="grid border-2 border-ink bg-white" style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}>
                    {tiers.map((tier, i) => {
                      const bis = tiers[i + 1] ? tiers[i + 1].minQty - 1 : null;
                      // Unter der ersten Staffel gilt deren Preis — also auch sie markieren
                      const isActive = totalQty < tiers[0].minQty
                        ? i === 0
                        : totalQty >= tier.minQty && (bis === null || totalQty <= bis);
                      return (
                        <div key={tier.minQty} className={`flex flex-col items-center text-center border-l-2 border-ink first:border-l-0 ${isActive ? 'bg-sun' : ''}`}>
                          <span className="text-[9px] font-bold uppercase px-1 py-1.5 w-full border-b-2 border-ink/15 leading-tight">
                            {T.ab} {tier.minQty}<br />{T.stueck}
                          </span>
                          <span className="font-black text-[12px] py-2">{eur(preis(tier.price))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 01 — Farbe */}
            <Schritt nr={naechster()} titel={T.farbeWaehlen}>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((c) => {
                  const an = selectedColor === c.name;
                  return (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} title={farbe(c.name)} aria-pressed={an}
                      className="flex flex-col items-center gap-1.5 group">
                      <span style={{ backgroundColor: c.hex }}
                        className={`w-11 h-11 border-2 flex items-center justify-center transition-all ${an ? 'border-tomato shadow-brutalist' : 'border-ink group-hover:-translate-y-0.5'}`}>
                        {an && <Check size={16} className="text-white drop-shadow" />}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wide ${an ? 'font-black' : 'opacity-60'}`}>{farbe(c.name)}</span>
                    </button>
                  );
                })}
              </div>
            </Schritt>

            {/* Stoffqualität (nur wenn vorhanden) */}
            {product.fabricOptions && (
              <Schritt nr={naechster()} titel={T.stoffWaehlen}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.fabricOptions.map((opt) => {
                    const an = selectedFabric === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setSelectedFabric(opt.value)}
                        className={`text-left px-4 py-3 border-2 border-ink transition-all ${an ? 'bg-ink text-white' : 'bg-white hover:bg-sun'}`}>
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase">
                          {an && <Check size={14} />}{opt.label} <span className="opacity-60 font-bold">{opt.weight}</span>
                        </span>
                        <span className="block text-[10px] opacity-70 mt-0.5">{opt.sublabel}</span>
                        {an && opt.careNote && <span className="block text-[9px] font-black mt-1.5 bg-sun text-ink px-2 py-1">{opt.careNote}</span>}
                      </button>
                    );
                  })}
                </div>
              </Schritt>
            )}

            {/* Größen & Stückzahlen */}
            {product.hasSizes ? (
              <Schritt nr={naechster()} titel={T.groessenStueck}>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" style={sizes.length < 8 ? { gridTemplateColumns: `repeat(${Math.min(sizes.length, 8)}, minmax(0, 1fr))` } : undefined}>
                  {sizes.map((size) => (
                    <div key={size} className="flex flex-col items-center gap-1.5">
                      <label htmlFor={`groesse-${size}`} className="text-[11px] font-black uppercase">{size}</label>
                      {/* Eingabefeld mit eigenen Pfeilen rechts (die des Browsers sind ausgeblendet) */}
                      <div className={`w-full flex border-2 border-ink ${sizeQtys[size] > 0 ? 'bg-sun/40' : 'bg-white'}`}>
                        <input
                          id={`groesse-${size}`} type="number" min="0" inputMode="numeric" value={sizeQtys[size] || ''} placeholder="0"
                          onChange={(e) => updateSize(size, e.target.value)}
                          aria-label={`${size} ${T.stueck}`}
                          className="w-full min-w-0 py-2.5 pl-1 text-center font-black text-sm outline-none bg-transparent focus:bg-sun [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="flex flex-col border-l-2 border-ink shrink-0">
                          <button type="button" onClick={() => updateSize(size, (sizeQtys[size] || 0) + 1)} aria-label={`${size} +1`}
                            className="flex-1 px-1 hover:bg-sun border-b border-ink/30 flex items-center justify-center"><ChevronUp size={12} strokeWidth={3} /></button>
                          <button type="button" onClick={() => updateSize(size, (sizeQtys[size] || 0) - 1)} aria-label={`${size} −1`}
                            className="flex-1 px-1 hover:bg-sun flex items-center justify-center"><ChevronDown size={12} strokeWidth={3} /></button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between gap-4 text-[10px] font-bold uppercase opacity-60">
                  <span>{f(T.mindestmenge, { min: minQty })}</span>
                  {aufpreisGroessen.length > 0 && (
                    <span>{f(T.aufpreisInfo, { sizes: aufpreisGroessen.join(' – '), preis: preis(groessenAufpreis(product, aufpreisGroessen[0])).toFixed(2) })}</span>
                  )}
                </div>
                {product.sizeChart && <SizeChart sizes={sizes} chart={product.sizeChart} />}
              </Schritt>
            ) : (
              <Schritt nr={naechster()} titel={T.mengeWaehlen}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-ink bg-white">
                    <button onClick={() => updateSize('-', Math.max(minQty, sizeQtys['-'] - 1))} className="px-4 py-2.5 hover:bg-sun transition-all" aria-label="−">
                      <Minus size={14} />
                    </button>
                    <input
                      type="number" min={minQty} value={sizeQtys['-']}
                      onChange={(e) => updateSize('-', Math.max(minQty, parseInt(e.target.value) || minQty))}
                      className="px-3 py-2.5 font-black text-sm border-x-2 border-ink w-20 text-center outline-none bg-transparent"
                    />
                    <button onClick={() => updateSize('-', sizeQtys['-'] + 1)} className="px-4 py-2.5 hover:bg-sun transition-all" aria-label="+">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] font-bold uppercase opacity-60">{f(T.mindestmenge, { min: minQty })}</span>
                </div>
              </Schritt>
            )}

            {/* Veredelung */}
            <Schritt nr={naechster()} titel={T.veredelungWaehlen}>
              <div className={`grid gap-2 ${availablePrints.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : availablePrints.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
                {availablePrints.map((opt) => {
                  const an = printType === opt.value;
                  const frei = FREE_PRINT_TYPES.includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => setPrintType(opt.value)} aria-pressed={an}
                      className={`px-3 py-3 text-left border-2 border-ink transition-all ${an ? 'bg-ink text-white shadow-brutalist' : 'bg-white hover:bg-sun'}`}>
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase leading-tight">
                        {an && <Check size={13} className="shrink-0" />}{T.druckSeite[opt.value]}
                      </span>
                      <span className={`block text-[8px] font-black mt-1 ${frei ? (an ? 'text-sun' : 'text-olive') : (an ? 'opacity-70' : 'text-tomato')}`}>
                        {frei ? (opt.price === 0 ? T.kostenlos : T.gratis) : `+${preis(opt.price).toFixed(2)}€ ${T.proStueck}`}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] opacity-60">{T.logoHinweis}</p>
            </Schritt>

            {/* Summe + Warenkorb */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 border-4 border-ink bg-white">
                <div className="p-4 border-r-4 border-ink">
                  <p className="text-[9px] font-black uppercase opacity-60">{T.gesamtmenge}</p>
                  <p className="font-black text-2xl">{totalQty} {T.stueck}</p>
                </div>
                <div className={`p-4 ${isValid ? 'bg-sun' : ''}`}>
                  <p className="text-[9px] font-black uppercase opacity-60">{T.gesamtpreis}</p>
                  <p className="font-black text-2xl">{(isValid ? preis(gesamtPreis) : 0).toFixed(2)}€</p>
                  {isValid && (
                    <p className="text-[9px] opacity-60">
                      {totalQty} × {preis(totalUnitPrice).toFixed(2)}€
                      {aufpreisGesamt > 0 && ` + ${preis(aufpreisGesamt).toFixed(2)}€ ${T.groessenaufpreis}`}
                    </p>
                  )}
                </div>
              </div>

              {!isValid && !added && (
                <p className="flex items-center gap-2 border-2 border-tomato bg-tomato/10 text-tomato px-4 py-2.5 text-[11px] font-black">
                  <AlertCircle size={15} className="shrink-0" /> {f(T.minWarnung, { min: minQty })}
                </p>
              )}

              <button onClick={handleAddToCart} disabled={!isValid}
                className={`w-full py-4 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all
                  ${added ? 'bg-olive text-white shadow-brutalist'
                    : !isValid ? 'bg-ink/20 text-ink/40 cursor-not-allowed border-4 border-ink/20'
                      : 'bg-ink text-white shadow-brutalist hover:bg-tomato active:translate-x-1 active:translate-y-1 active:shadow-none'}`}>
                <ShoppingBag size={18} />
                {added ? T.hinzugefuegt : T.inWarenkorb}
              </button>

              {product.deliveryTime && (
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Truck size={15} className="shrink-0" />
                  <span className="opacity-50">{T.lieferzeit}</span>
                  <span className={`px-2 py-0.5 ${product.deliveryTime.startsWith('1') ? 'bg-olive text-white' : 'bg-sun text-ink'}`}>{product.deliveryTime}</span>
                  <span className="opacity-40 normal-case font-medium text-[9px] tracking-normal">{T.abZahlung}</span>
                </p>
              )}
            </div>

            {/* Details / Pflege als Reiter statt zwei großer Kästen */}
            {tabs.length > 0 && (
              <div>
                <div className="flex gap-6 border-b-2 border-ink/15" role="tablist">
                  {tabs.map(([k, label]) => (
                    <button key={k} role="tab" aria-selected={aktiverTab === k} onClick={() => setTab(k)}
                      className={`pb-2.5 -mb-[2px] text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${aktiverTab === k ? 'border-tomato' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="pt-4">
                  {aktiverTab === 'details' && (
                    <>
                      {product.marketingText && (
                        <p className="text-sm font-medium italic opacity-70 mb-4 leading-relaxed">„{product.marketingText}"</p>
                      )}
                      {product.details && (
                        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[11px] leading-relaxed">
                          {product.details.map((item, i) => {
                            const [label, ...rest] = item.split(':');
                            return rest.length ? (
                              <div key={i} className="contents">
                                <dt className="font-black">{label}:</dt>
                                <dd className="m-0">{rest.join(':').trim()}</dd>
                              </div>
                            ) : (
                              <dd key={i} className="m-0 col-span-2">{label}</dd>
                            );
                          })}
                        </dl>
                      )}
                    </>
                  )}
                  {aktiverTab === 'pflege' && (
                    <div className="grid grid-cols-1 gap-2">
                      {product.washing.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 text-[11px]">
                          <span className="text-[16px] flex-shrink-0 leading-none">{pflegeIcon(item)}</span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Link href={p('/produkte')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-tomato transition-all w-fit">
              <ArrowLeft size={14} />
              {T.zurueck}
            </Link>

          </div>
        </div>
      </div>

      <ProduktSeoBlock seo={seo} category={product.category} p={p} />
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
}
