'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { PRODUCTS as ALL_PRODUCTS } from '@/data/products';
const PRODUCTS = ALL_PRODUCTS.filter(p => !p.comingSoon);
import { Plus, Trash2, LogOut, CheckCircle } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRINT_OPTIONS = [
  { value: 'none',             label: 'Kein Druck',                price: 0, minQty: 0   },
  { value: 'front',            label: 'DTF Vorderdruck',           price: 0, minQty: 0   },
  { value: 'back',             label: 'DTF Rückendruck',           price: 0, minQty: 0   },
  { value: 'both',             label: 'DTF Vorder- & Rückendruck', price: 0, minQty: 0   },
  { value: 'siebdruck',        label: 'Siebdruck',                 price: 3, minQty: 150 },
  { value: 'bestickung_front', label: 'Bestickung Vorne',          price: 2, minQty: 0   },
  { value: 'bestickung_back',  label: 'Bestickung Hinten',         price: 3, minQty: 0   },
  { value: 'bestickung_both',  label: 'Bestickung Vorne + Hinten', price: 5, minQty: 0   },
];

const isBestickung = (v) => v.startsWith('bestickung');

function getAvailablePrints(product, qty) {
  const byQty = (o) => qty >= o.minQty;
  const id = product.id;
  if (id === 'tshirt' || id === 'polo') return PRINT_OPTIONS.filter(o => !isBestickung(o.value));
  if (id === 'sweat' || id === 'fleece') return PRINT_OPTIONS;
  return PRINT_OPTIONS.filter(o => o.value !== 'back' && o.value !== 'both' && !o.value.endsWith('_back') && !o.value.endsWith('_both'));
}

function getTierPrice(product, qty) {
  let price = product.tiers[0].price;
  for (const tier of product.tiers) {
    if (qty >= tier.minQty) price = tier.price;
  }
  return price;
}

function getPrintPrice(productId, printValue) {
  const opt = PRINT_OPTIONS.find(o => o.value === printValue);
  if (!opt) return 0;
  if (printValue === 'siebdruck' && productId === 'tshirt') return 0;
  return opt.price;
}

function emptySize() {
  return Object.fromEntries(SIZES.map(s => [s, 0]));
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm"
      />
    </div>
  );
}

export default function VerkaufPage() {
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState([]);

  const [selProd, setSelProd] = useState(PRODUCTS[0].id);
  const [selColor, setSelColor] = useState(PRODUCTS[0].colors[0].name);
  const [selPrint, setSelPrint] = useState('none');
  const [qty, setQty] = useState(10);
  const [sizes, setSizes] = useState(emptySize());

  const [cust, setCust] = useState({ name: '', company: '', email: '', phone: '', street: '', plz: '', city: '' });
  const [note, setNote] = useState('');

  const [rabattType, setRabattType] = useState('%');
  const [rabattValue, setRabattValue] = useState('');
  const [provisionRate, setProvisionRateState] = useState(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [error, setError] = useState('');

  const product = PRODUCTS.find(p => p.id === selProd);

  useEffect(() => {
    setSelColor(product.colors[0].name);
    setSelPrint('none');
    setSizes(emptySize());
    setQty(10);
  }, [selProd]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      const { data: reseller } = await supabase
        .from('resellers')
        .select('discount_rate')
        .eq('email', data.user.email)
        .single();
      if (reseller?.discount_rate) {
        setProvisionRateState(parseFloat(reseller.discount_rate));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/verkauf/login');
  };

  const itemQty = product?.hasSizes
    ? Object.values(sizes).reduce((s, v) => s + (parseInt(v) || 0), 0)
    : (parseInt(qty) || 0);

  const printOptions = getAvailablePrints(product, itemQty);

  const addItem = () => {
    if (itemQty < 1) return;
    if (selPrint === 'siebdruck' && itemQty < 150) return;
    const price = getTierPrice(product, itemQty) + getPrintPrice(product.id, selPrint);
    const sizesData = product.hasSizes
      ? Object.fromEntries(
          Object.entries(sizes)
            .filter(([, v]) => parseInt(v) > 0)
            .map(([k, v]) => [k, parseInt(v)])
        )
      : { '-': itemQty };

    setItems(prev => [...prev, {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      color: selColor,
      printType: selPrint,
      sizes: sizesData,
      qty: itemQty,
      price,
    }]);
    setSizes(emptySize());
    setQty(10);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const rv = parseFloat(rabattValue) || 0;
  const rabattAmount = rabattType === '%'
    ? subtotal * rv / 100
    : Math.min(rv, subtotal);
  const afterDiscount = subtotal - rabattAmount;
  const shippingCost = afterDiscount >= 300 ? 0 : (afterDiscount > 0 ? 5.90 : 0);
  const total = afterDiscount + shippingCost;
  const provisionAmount = total * provisionRate / 100;
  const kittelwerkAmount = total - provisionAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { setError('Bitte mindestens ein Produkt hinzufügen.'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/verkauf-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...cust,
        note,
        items: items.map(({ id, ...rest }) => rest),
        subtotal,
        discountLabel: rabattValue ? `Rabatt ${rv}${rabattType}` : null,
        discountAmount: rabattAmount,
        shippingCost,
        total,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Fehler beim Erstellen der Bestellung.');
      setLoading(false);
      return;
    }

    setSuccessEmail(cust.email);
    setSuccess(true);
    setItems([]);
    setCust({ name: '', company: '', email: '', phone: '', street: '', plz: '', city: '' });
    setRabattValue('');
    setNote('');
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="bg-white border-4 border-ink shadow-brutalist p-10 text-center space-y-4 max-w-sm w-full mx-4">
          <CheckCircle size={40} className="mx-auto text-olive" />
          <h2 className="font-black text-2xl uppercase">Bestellung erstellt!</h2>
          {successEmail && (
            <p className="text-sm opacity-60">Bestätigung wurde an <strong>{successEmail}</strong> gesendet.</p>
          )}
          <button onClick={() => setSuccess(false)}
            className="w-full bg-ink text-white py-4 font-black uppercase hover:bg-tomato transition-all shadow-brutalist">
            Neue Bestellung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-white border-b-4 border-ink px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-serif font-black text-2xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>. Verkauf
          </h1>
          {provisionRate > 0 && (
            <p className="text-[10px] font-black uppercase tracking-widest text-olive mt-0.5">
              Ihre Provision: {provisionRate}%
            </p>
          )}
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-tomato hover:text-white transition-all">
          <LogOut size={14} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SOL: Ürün seçimi + sepet */}
        <div className="space-y-6">

          {/* Ürün Seçimi */}
          <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-5">
            <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Produkt hinzufügen</h2>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">Produkt</label>
              <select value={selProd} onChange={e => setSelProd(e.target.value)}
                className="w-full border-2 border-ink p-3 bg-white focus:bg-sun outline-none text-sm font-bold">
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — ab {p.tiers[0].price.toFixed(2)}€</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest">Farbe</label>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(c => (
                  <button key={c.name} type="button" onClick={() => setSelColor(c.name)}
                    className={`flex items-center gap-2 px-3 py-2 border-2 text-[11px] font-black transition-all ${selColor === c.name ? 'border-ink bg-sun' : 'border-ink/30 hover:border-ink'}`}>
                    <span className="w-3 h-3 rounded-full border border-black/20 flex-shrink-0" style={{ background: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">Druckart</label>
              <select value={selPrint} onChange={e => setSelPrint(e.target.value)}
                className="w-full border-2 border-ink p-3 bg-white focus:bg-sun outline-none text-sm font-bold">
                {printOptions.map(o => {
                  const locked = itemQty < o.minQty;
                  const isFreeOpt = o.price === 0 || (o.value === 'siebdruck' && product.id === 'tshirt');
                  const suffix = locked
                    ? ` — ab ${o.minQty} Stk`
                    : isFreeOpt
                      ? ' — kostenlos'
                      : ` — +${o.price.toFixed(2)}€/Stk`;
                  return (
                    <option key={o.value} value={o.value} disabled={locked}>
                      {o.label}{suffix}
                    </option>
                  );
                })}
              </select>
            </div>

            {product.hasSizes ? (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Größen</label>
                <div className="grid grid-cols-6 gap-2">
                  {SIZES.map(s => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black opacity-50">{s}</span>
                      <input type="number" min="0" value={sizes[s]}
                        onChange={e => setSizes(prev => ({ ...prev, [s]: parseInt(e.target.value) || 0 }))}
                        className="w-full border-2 border-ink p-2 text-center text-sm font-black focus:bg-sun outline-none" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] opacity-50">Gesamt: <strong>{itemQty}</strong> Stück</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">Menge</label>
                <input type="number" min="1" value={qty}
                  onChange={e => setQty(e.target.value)}
                  className="w-32 border-2 border-ink p-3 text-center font-black focus:bg-sun outline-none" />
              </div>
            )}

            {itemQty > 0 && (
              <p className="text-[11px] font-bold text-olive bg-olive/10 px-3 py-2 border border-olive/30">
                {(() => {
                  const base = getTierPrice(product, itemQty);
                  const print = getPrintPrice(product.id, selPrint);
                  const unit = base + print;
                  return <>→ {itemQty} Stück × {unit.toFixed(2)}€{print > 0 && ` (inkl. +${print.toFixed(2)}€ Druck)`} = <strong>{(itemQty * unit).toFixed(2)}€</strong></>;
                })()}
              </p>
            )}

            <button type="button" onClick={addItem} disabled={itemQty < 1}
              className="w-full bg-ink text-white py-3 font-black uppercase flex items-center justify-center gap-2 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-30">
              <Plus size={16} /> Hinzufügen
            </button>
          </div>

          {/* Sepet */}
          {items.length > 0 && (
            <div className="bg-white border-4 border-ink shadow-brutalist">
              <div className="bg-ink text-white px-5 py-3">
                <h2 className="font-black text-xs uppercase tracking-widest">
                  Bestellpositionen ({items.length})
                </h2>
              </div>
              <div className="divide-y-2 divide-ink/10">
                {items.map(item => {
                  const sizeStr = item.sizes['-'] !== undefined
                    ? `${item.sizes['-']} Stück`
                    : Object.entries(item.sizes).map(([k, v]) => `${k}×${v}`).join(' · ');
                  const printLabel = PRINT_OPTIONS.find(p => p.value === item.printType)?.label;
                  return (
                    <div key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">{item.name}</p>
                        <p className="text-[10px] opacity-50 mt-0.5">{item.color} · {sizeStr}</p>
                        {item.printType !== 'none' && (
                          <span className="inline-block mt-1 text-[9px] font-black bg-tomato text-white px-1.5 py-0.5">
                            {printLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-sm">{(item.price * item.qty).toFixed(2)}€</p>
                        <p className="text-[10px] opacity-50">{item.qty} × {item.price.toFixed(2)}€</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)}
                        className="p-1.5 border-2 border-transparent hover:border-tomato hover:text-tomato transition-all flex-shrink-0 mt-0.5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SAĞ: Müşteri formu + Rabatt + Özet */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Kundendaten */}
            <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-4">
              <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Kundendaten</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name *" value={cust.name} onChange={v => setCust(p => ({ ...p, name: v }))} required />
                <Field label="Restaurant / Firma *" value={cust.company} onChange={v => setCust(p => ({ ...p, company: v }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="E-Mail (optional)" type="email" value={cust.email} onChange={v => setCust(p => ({ ...p, email: v }))} placeholder="optional" />
                <Field label="Telefon *" value={cust.phone} onChange={v => setCust(p => ({ ...p, phone: v }))} required />
              </div>
              <Field label="Straße & Hausnummer *" value={cust.street} onChange={v => setCust(p => ({ ...p, street: v }))} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="PLZ *" value={cust.plz} onChange={v => setCust(p => ({ ...p, plz: v }))} required />
                <Field label="Stadt *" value={cust.city} onChange={v => setCust(p => ({ ...p, city: v }))} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">Notiz (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  rows={3} placeholder="Zusätzliche Hinweise zur Bestellung..."
                  className="border-2 border-ink p-3 focus:bg-sun outline-none text-sm resize-none" />
              </div>
            </div>

            {/* Rabatt */}
            <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-4">
              <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Rabatt</h2>
              <div className="flex gap-3 items-end">
                <div className="flex border-2 border-ink flex-shrink-0">
                  {['%', '€'].map(t => (
                    <button key={t} type="button" onClick={() => { setRabattType(t); setRabattValue(''); }}
                      className={`px-5 py-3 font-black text-sm transition-all ${rabattType === t ? 'bg-ink text-white' : 'hover:bg-sun'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">
                    {rabattType === '%' ? 'Prozent' : 'Betrag in Euro'}
                  </label>
                  <input type="number" min="0" step="0.01" value={rabattValue}
                    onChange={e => setRabattValue(e.target.value)}
                    placeholder="0"
                    className="w-full border-2 border-ink p-3 font-black focus:bg-sun outline-none text-sm" />
                </div>
              </div>
              {rabattAmount > 0 && (
                <p className="text-[11px] font-bold text-olive bg-olive/10 px-3 py-2 border border-olive/30">
                  → Rabatt: −{rabattAmount.toFixed(2)}€
                  {rabattType === '%' && ` (${rv}% von ${subtotal.toFixed(2)}€)`}
                </p>
              )}
            </div>

            {/* Zusammenfassung */}
            {items.length > 0 && (
              <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-3">
                <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Zusammenfassung</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-60">Zwischensumme</span>
                    <span className="font-bold">{subtotal.toFixed(2)}€</span>
                  </div>
                  {rabattAmount > 0 && (
                    <div className="flex justify-between text-olive font-bold">
                      <span>Rabatt ({rv}{rabattType})</span>
                      <span>−{rabattAmount.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="opacity-60">Versandkosten</span>
                    <span className="font-bold">{shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)}€`}</span>
                  </div>
                  <div className="flex justify-between font-black text-xl border-t-2 border-ink pt-3 mt-2">
                    <span>TOTAL</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                  {provisionRate > 0 && (
                    <div className="border-t-2 border-dashed border-ink/30 pt-3 mt-1 space-y-1">
                      <div className="flex justify-between text-[11px] font-black text-olive">
                        <span>Ihre Provision ({provisionRate}%)</span>
                        <span>+{provisionAmount.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold opacity-50">
                        <span>An Kittelwerk</span>
                        <span>{kittelwerkAmount.toFixed(2)}€</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="text-tomato text-[11px] font-black uppercase border-2 border-tomato px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || items.length === 0}
              className="w-full bg-tomato text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-ink transition-all shadow-brutalist disabled:opacity-30">
              {loading ? 'Wird gespeichert...' : 'Bestellung erstellen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
