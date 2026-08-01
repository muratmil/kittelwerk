'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { PRODUCTS as ALL_PRODUCTS } from '@/data/products';
const PRODUCTS = ALL_PRODUCTS.filter(p => !p.comingSoon);
import { Plus, Trash2, LogOut, CheckCircle, Clock, ChevronDown, ChevronUp, Lock, Save, User } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRINT_OPTIONS = [
  { value: 'none',  label: 'Kein Druck' },
  { value: 'front', label: 'Vorderdruck' },
  { value: 'back',  label: 'Rückendruck' },
  { value: 'both',  label: 'Vorder + Rücken' },
];

const STATUS_LABELS = {
  new: 'Neu', processing: 'In Bearbeitung',
  shipped: 'Versandt', done: 'Abgeschlossen', cancelled: 'Storniert',
};
const STATUS_COLORS = {
  new: 'bg-sun text-ink', processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-olive/20 text-olive', done: 'bg-ink/10 text-ink/50',
  cancelled: 'bg-tomato/10 text-tomato',
};
const STATUS_DESCRIPTIONS = {
  new: 'Ihre Bestellung ist eingegangen und wird geprüft.',
  processing: 'Ihre Bestellung wird aktuell produziert.',
  shipped: 'Ihre Bestellung ist unterwegs zu Ihnen.',
  done: 'Ihre Bestellung wurde abgeschlossen.',
  cancelled: 'Diese Bestellung wurde storniert.',
};

function getTierPrice(product, qty) {
  let price = product.tiers[0].price;
  for (const tier of product.tiers) {
    if (qty >= tier.minQty) price = tier.price;
  }
  return price;
}

function emptySize(product) {
  return Object.fromEntries((product?.sizes || SIZES).map(s => [s, 0]));
}

export default function ResellerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reseller, setReseller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const [items, setItems] = useState([]);
  const [selProd, setSelProd] = useState(PRODUCTS[0].id);
  const [selColor, setSelColor] = useState(PRODUCTS[0].colors[0].name);
  const [selPrint, setSelPrint] = useState('none');
  const [qty, setQty] = useState(10);
  const [sizes, setSizes] = useState(() => emptySize(PRODUCTS[0]));
  const [note, setNote] = useState('');
  const [jobName, setJobName] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [infoOpen, setInfoOpen] = useState(false);
  const [error, setError] = useState('');

  // Mein Konto
  const [acct, setAcct] = useState({ contact_name: '', phone: '', street: '', plz: '', city: '' });
  const [acctSaving, setAcctSaving] = useState(false);
  const [acctMsg, setAcctMsg] = useState('');
  const [pw, setPw] = useState({ p1: '', p2: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const product = PRODUCTS.find(p => p.id === selProd);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/reseller/login'); return; }

      const { data: res } = await supabase
        .from('resellers')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (!res) { await supabase.auth.signOut(); router.push('/reseller/login'); return; }

      if (res.active === false) {
        setIsPending(true);
        setLoadingInit(false);
        return;
      }

      setReseller(res);
      setAcct({
        contact_name: res.contact_name || '',
        phone: res.phone || '',
        street: res.street || '',
        plz: res.plz || '',
        city: res.city || '',
      });

      const { data: ord } = await supabase
        .from('reseller_orders')
        .select('*')
        .eq('reseller_id', res.id)
        .order('created_at', { ascending: false });
      setOrders(ord || []);
      setLoadingInit(false);
    };
    init();
  }, []);

  useEffect(() => {
    setSelColor(product.colors[0].name);
    setSelPrint('none');
    setSizes(emptySize(product));
    setQty(10);
  }, [selProd]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/reseller/login');
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setAcctSaving(true);
    setAcctMsg('');
    const res = await fetch('/api/reseller-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acct),
    });
    const data = await res.json();
    if (!res.ok) { setAcctMsg(data.error || 'Fehler beim Speichern.'); setAcctSaving(false); return; }
    setReseller(data.reseller);
    setAcctMsg('Gespeichert!');
    setAcctSaving(false);
    setTimeout(() => setAcctMsg(''), 3000);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pw.p1.length < 8) { setPwMsg('Passwort muss mindestens 8 Zeichen haben.'); return; }
    if (pw.p1 !== pw.p2) { setPwMsg('Passwörter stimmen nicht überein.'); return; }
    setPwSaving(true);
    const { error: pwError } = await supabase.auth.updateUser({ password: pw.p1 });
    if (pwError) { setPwMsg(pwError.message || 'Fehler beim Ändern.'); setPwSaving(false); return; }
    setPw({ p1: '', p2: '' });
    setPwMsg('Passwort erfolgreich geändert!');
    setPwSaving(false);
    setTimeout(() => setPwMsg(''), 3000);
  };

  const itemQty = product?.hasSizes
    ? Object.values(sizes).reduce((s, v) => s + (parseInt(v) || 0), 0)
    : (parseInt(qty) || 0);

  const printOptions = product?.bestickungOnly ? [] : PRINT_OPTIONS.filter(o => {
    if (o.value === 'back' || o.value === 'both') return !!product?.hasBackPrint;
    return true;
  });

  const basePrice = itemQty > 0 ? getTierPrice(product, itemQty) : product.tiers[0].price;
  const discountRate = reseller?.discount_rate || 15;
  const resellerPrice = basePrice * (1 - discountRate / 100);

  const addItem = () => {
    if (itemQty < 1) return;
    const sizesData = product.hasSizes
      ? Object.fromEntries(Object.entries(sizes).filter(([, v]) => parseInt(v) > 0).map(([k, v]) => [k, parseInt(v)]))
      : { '-': itemQty };

    setItems(prev => [...prev, {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      color: selColor,
      printType: selPrint,
      sizes: sizesData,
      qty: itemQty,
      price: resellerPrice,
      basePrice,
    }]);
    setSizes(emptySize(product));
    setQty(10);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.basePrice * i.qty, 0);
  const discountAmount = subtotal * discountRate / 100;
  const afterDiscount = subtotal - discountAmount;
  const shippingCost = afterDiscount >= 300 ? 0 : (afterDiscount > 0 ? 5.90 : 0);
  const total = afterDiscount + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { setError('Bitte mindestens ein Produkt hinzufügen.'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/reseller-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(({ id, ...rest }) => rest),
        note,
        jobName,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Fehler beim Erstellen der Bestellung.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setItems([]);
    setNote('');
    setJobName('');

    // Sipariş geçmişini güncelle
    const { data: ord } = await supabase
      .from('reseller_orders')
      .select('*')
      .eq('reseller_id', reseller.id)
      .order('created_at', { ascending: false });
    setOrders(ord || []);
    setLoading(false);

    setTimeout(() => setSuccess(false), 3000);
  };

  if (loadingInit) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-serif italic opacity-40 uppercase">Wird geladen...</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="font-serif font-black text-4xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>.
          </h1>
          <div className="bg-white border-4 border-ink shadow-brutalist p-8 space-y-4">
            <Clock size={40} className="mx-auto opacity-40" />
            <h2 className="font-black text-xl uppercase">Anfrage wird geprüft</h2>
            <p className="text-[13px] opacity-60">Ihre Händleranfrage wird geprüft. Sie erhalten eine E-Mail, sobald Ihr Zugang freigeschaltet wurde.</p>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/reseller/login'); }}
              className="w-full bg-ink text-white py-3 font-black uppercase text-[11px] tracking-wider hover:bg-tomato transition-all flex items-center justify-center gap-2">
              <LogOut size={14} /> Ausloggen
            </button>
          </div>
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
            Kittel<span className="text-tomato">werk</span>. Händlerbereich
          </h1>
          <p className="text-[10px] opacity-50 mt-0.5">{reseller?.company} · {discountRate}% Händlerrabatt</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-tomato hover:text-white transition-all">
          <LogOut size={14} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SOL: Ürün seçimi + sepet */}
        <div className="space-y-6">

          {success && (
            <div className="bg-olive/10 border-2 border-olive p-4 flex items-center gap-3">
              <CheckCircle size={18} className="text-olive flex-shrink-0" />
              <p className="font-black text-sm uppercase text-olive">Bestellung erfolgreich erstellt!</p>
            </div>
          )}

          {/* Produktinfo — Referenz für Händler bei Kundenfragen */}
          <div className="bg-white border-4 border-ink shadow-brutalist overflow-hidden">
            <div className="bg-ink text-white px-5 py-3 flex items-center gap-2">
              <h2 className="font-black text-xs uppercase tracking-widest">Produktinfo</h2>
              <span className="text-[10px] opacity-50">für Kundenfragen</span>
            </div>
            <div className="p-5 flex flex-col sm:flex-row gap-5">
              {product.image && (
                <div className="sm:w-40 flex-shrink-0">
                  <img src={product.image} alt={product.name}
                    className="w-full aspect-square object-cover border-2 border-ink bg-paper" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div>
                  <h3 className="font-black text-lg leading-tight">{product.name}</h3>
                  {product.desc && <p className="text-[12px] opacity-60">{product.desc}</p>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                  {product.deliveryTime && <span><span className="opacity-50">Lieferzeit:</span> <strong>{product.deliveryTime}</strong></span>}
                  <span><span className="opacity-50">Farben:</span> <strong>{product.colors.map(c => c.name).join(', ')}</strong></span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Staffelpreise (Verkaufspreis Kunde)</p>
                  <div className="flex flex-wrap gap-1">
                    {product.tiers.map(t => (
                      <span key={t.minQty} className="text-[10px] border border-ink/20 px-1.5 py-0.5">
                        ab {t.minQty}: <strong>{t.price.toFixed(2)}€</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {(product.longDesc || product.details?.length || product.washing?.length) && (
              <>
                <button type="button" onClick={() => setInfoOpen(o => !o)}
                  className="w-full border-t-2 border-ink px-5 py-2.5 flex items-center justify-between text-[11px] font-black uppercase tracking-widest hover:bg-paper transition-colors">
                  <span>Details & Pflege</span>
                  {infoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {infoOpen && (
                  <div className="px-5 pb-5 pt-3 space-y-3 bg-paper/30 border-t border-ink/10">
                    {product.longDesc && <p className="text-[12px] leading-relaxed opacity-80">{product.longDesc}</p>}
                    {product.details?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Eigenschaften</p>
                        <ul className="text-[11px] space-y-0.5 list-disc pl-4 opacity-80">
                          {product.details.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}
                    {product.washing?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Pflegehinweise</p>
                        <ul className="text-[11px] space-y-0.5 list-disc pl-4 opacity-80">
                          {product.washing.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-5">
            <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Produkt hinzufügen</h2>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest">Produkt</label>
              <select value={selProd} onChange={e => setSelProd(e.target.value)}
                className="w-full border-2 border-ink p-3 bg-white focus:bg-sun outline-none text-sm font-bold">
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
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

            {printOptions.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Druckart</label>
                <div className="flex flex-wrap gap-2">
                  {printOptions.map(o => (
                    <button key={o.value} type="button" onClick={() => setSelPrint(o.value)}
                      className={`px-3 py-1.5 border-2 text-[11px] font-black transition-all ${selPrint === o.value ? 'border-ink bg-ink text-white' : 'border-ink/30 hover:border-ink'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.hasSizes ? (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Größen</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(product.sizes || SIZES).map(s => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black opacity-50">{s}</span>
                      <div className="flex items-center border-2 border-ink w-full">
                        <button type="button"
                          onClick={() => setSizes(prev => ({ ...prev, [s]: Math.max(0, (prev[s] || 0) - 1) }))}
                          className="px-1.5 py-1.5 text-sm font-black hover:bg-sun transition-all leading-none select-none">−</button>
                        <input type="number" min="0" value={sizes[s]}
                          onChange={e => setSizes(prev => ({ ...prev, [s]: parseInt(e.target.value) || 0 }))}
                          className="flex-1 w-0 min-w-0 py-1.5 text-center text-sm font-black focus:bg-sun outline-none border-x-2 border-ink" />
                        <button type="button"
                          onClick={() => setSizes(prev => ({ ...prev, [s]: (prev[s] || 0) + 1 }))}
                          className="px-1.5 py-1.5 text-sm font-black hover:bg-sun transition-all leading-none select-none">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] opacity-50">Gesamt: <strong>{itemQty}</strong> Stück</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">Menge</label>
                <div className="flex items-center border-2 border-ink w-32">
                  <button type="button"
                    onClick={() => setQty(q => Math.max(1, (parseInt(q) || 1) - 1))}
                    className="px-3 py-3 font-black hover:bg-sun transition-all leading-none select-none">−</button>
                  <input type="number" min="1" value={qty}
                    onChange={e => setQty(e.target.value)}
                    className="flex-1 w-0 min-w-0 py-3 text-center font-black focus:bg-sun outline-none border-x-2 border-ink" />
                  <button type="button"
                    onClick={() => setQty(q => (parseInt(q) || 1) + 1)}
                    className="px-3 py-3 font-black hover:bg-sun transition-all leading-none select-none">+</button>
                </div>
              </div>
            )}

            {/* Fiyat önizleme — her zaman görünür */}
            <div className={`border-4 p-4 space-y-2 transition-all ${itemQty > 0 ? 'border-olive bg-olive/10' : 'border-ink/20 bg-paper'}`}>
              <p className="text-[9px] font-black uppercase opacity-50 tracking-widest">Preisvorschau</p>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] opacity-50">Listenpreis</span>
                <span className="text-[11px] line-through opacity-40">{itemQty > 0 ? `${itemQty} × ${basePrice.toFixed(2)}€ = ${(itemQty * basePrice).toFixed(2)}€` : `— × ${basePrice.toFixed(2)}€`}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-black text-olive">{discountRate}% Händlerrabatt</span>
                <span className="text-[11px] font-black text-olive">{itemQty > 0 ? `−${(itemQty * (basePrice - resellerPrice)).toFixed(2)}€` : '—'}</span>
              </div>
              <div className="flex justify-between items-baseline border-t-2 border-ink/20 pt-2">
                <span className="font-black text-sm uppercase">Ihr Preis</span>
                <span className="font-black text-xl">{itemQty > 0 ? `${(itemQty * resellerPrice).toFixed(2)}€` : `ab ${resellerPrice.toFixed(2)}€/Stk`}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-ink/10 pt-1.5 mt-1">
                <span className="text-[10px] opacity-50">Verkaufspreis (Kunde)</span>
                <span className="text-[10px] opacity-50">{itemQty > 0 ? `${(itemQty * basePrice).toFixed(2)}€` : `${basePrice.toFixed(2)}€/Stk`}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-tomato uppercase">Ihr Gewinn</span>
                <span className="text-[10px] font-black text-tomato">
                  {itemQty > 0
                    ? `+${(itemQty * (basePrice - resellerPrice)).toFixed(2)}€ (${((basePrice - resellerPrice) / basePrice * 100).toFixed(0)}%)`
                    : `+${(basePrice - resellerPrice).toFixed(2)}€/Stk`}
                </span>
              </div>
            </div>

            <button type="button" onClick={addItem} disabled={itemQty < 1}
              className="w-full bg-ink text-white py-3 font-black uppercase flex items-center justify-center gap-2 hover:bg-tomato transition-all shadow-brutalist disabled:opacity-30">
              <Plus size={16} /> In den Warenkorb
            </button>
          </div>

          {/* Sepet */}
          {items.length > 0 && (
            <div className="bg-white border-4 border-ink shadow-brutalist">
              <div className="bg-ink text-white px-5 py-3">
                <h2 className="font-black text-xs uppercase tracking-widest">Bestellpositionen ({items.length})</h2>
              </div>
              <div className="divide-y-2 divide-ink/10">
                {items.map(item => {
                  const sizeStr = item.sizes['-'] !== undefined
                    ? `${item.sizes['-']} Stück`
                    : Object.entries(item.sizes).map(([k, v]) => `${k}×${v}`).join(' · ');
                  return (
                    <div key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">{item.name}</p>
                        <p className="text-[10px] opacity-50 mt-0.5">{item.color} · {sizeStr}</p>
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

        {/* SAĞ: Özet + Not + Gönder */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {items.length > 0 && (
              <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-3">
                <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Zusammenfassung</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-60">Listenpreis</span>
                    <span className="line-through opacity-40">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-olive font-bold">
                    <span>Händlerrabatt ({discountRate}%)</span>
                    <span>−{discountAmount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Versandkosten</span>
                    <span className="font-bold">{shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)}€`}</span>
                  </div>
                  <div className="flex justify-between font-black text-xl border-t-2 border-ink pt-3 mt-2">
                    <span>TOTAL</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-3">
              <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Auftrag / Firmenname</h2>
              <input value={jobName} onChange={e => setJobName(e.target.value)}
                maxLength={120} placeholder="z. B. Restaurant Mustermann"
                className="w-full border-2 border-ink p-3 focus:bg-sun outline-none text-sm font-bold" />
              <p className="text-[10px] opacity-50">Für wen ist diese Bestellung? Erscheint als Titel in der Atölye.</p>
            </div>

            <div className="bg-white border-4 border-ink shadow-brutalist p-6 space-y-3">
              <h2 className="font-black text-xs uppercase tracking-widest border-b-2 border-ink pb-3">Notiz (optional)</h2>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                rows={3} placeholder="Lieferhinweise, Sonderwünsche..."
                className="w-full border-2 border-ink p-3 focus:bg-sun outline-none text-sm resize-none" />
            </div>

            {error && (
              <p className="text-tomato text-[11px] font-black uppercase border-2 border-tomato px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || items.length === 0}
              className="w-full bg-tomato text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-ink transition-all shadow-brutalist disabled:opacity-30">
              {loading ? 'Wird gespeichert...' : 'Bestellung absenden'}
            </button>
          </form>

          {/* Sipariş Geçmişi */}
          {orders.length > 0 && (
            <div className="bg-white border-4 border-ink shadow-brutalist">
              <div className="bg-ink text-white px-5 py-3 flex items-center gap-2">
                <Clock size={14} />
                <h2 className="font-black text-xs uppercase tracking-widest">Bestellhistorie</h2>
              </div>
              <div className="divide-y-2 divide-ink/10">
                {orders.map(ord => {
                  const date = new Date(ord.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const totalQty = ord.items?.reduce((s, i) => s + i.qty, 0) || 0;
                  const isOpen = !!expandedOrders[ord.id];
                  const status = ord.status || 'new';
                  return (
                    <div key={ord.id} className="border-b-2 border-ink/10 last:border-b-0">
                      {/* Header row — always visible, clickable */}
                      <button
                        type="button"
                        onClick={() => setExpandedOrders(prev => ({ ...prev, [ord.id]: !prev[ord.id] }))}
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-paper/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-black uppercase px-2 py-1 ${STATUS_COLORS[status]}`}>
                              {STATUS_LABELS[status]}
                            </span>
                            <span className="text-[11px] font-black text-ink/50">{date}</span>
                          </div>
                          <p className="text-[11px] text-ink/60 mt-1">{STATUS_DESCRIPTIONS[status]}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-black text-sm">{Number(ord.total).toFixed(2)}€</p>
                            <p className="text-[10px] text-ink/50">{totalQty} Stück</p>
                          </div>
                          {isOpen ? <ChevronUp size={16} className="opacity-50" /> : <ChevronDown size={16} className="opacity-50" />}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div className="px-5 pb-4 bg-paper/30 border-t border-ink/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 pt-3 pb-2">Artikel</p>
                          <div className="space-y-2">
                            {ord.items?.map((item, idx) => {
                              const sizeEntries = Object.entries(item.sizes || {}).filter(([k, v]) => k !== '-' && v > 0);
                              return (
                                <div key={idx} className="text-[11px]">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-black">{item.name}</span>
                                    <span className="font-black">{((item.price ?? item.unitPrice ?? 0) * item.qty).toFixed(2)}€</span>
                                  </div>
                                  <div className="text-ink/50 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                    {item.color && <span>{item.color}</span>}
                                    {sizeEntries.length > 0 && (
                                      <span>{sizeEntries.map(([s, v]) => `${s}×${v}`).join(' ')}</span>
                                    )}
                                    <span>{item.qty} Stk. · {(item.price ?? item.unitPrice ?? 0).toFixed(2)}€/Stk.</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 pt-3 border-t border-ink/10 space-y-1.5">
                            {ord.subtotal != null && (
                              <div className="flex justify-between items-baseline text-[11px]">
                                <span className="text-ink/50">Listenpreis</span>
                                <span className="line-through text-ink/40">{Number(ord.subtotal).toFixed(2)}€</span>
                              </div>
                            )}
                            {Number(ord.discount_amount) > 0 && (
                              <div className="flex justify-between items-baseline text-[11px] font-bold text-olive">
                                <span>Händlerrabatt ({Number(ord.discount_rate).toFixed(0)}%)</span>
                                <span>−{Number(ord.discount_amount).toFixed(2)}€</span>
                              </div>
                            )}
                            {ord.shipping_cost != null && (
                              <div className="flex justify-between items-baseline text-[11px]">
                                <span className="text-ink/50">Versandkosten</span>
                                <span className="font-bold">{Number(ord.shipping_cost) === 0 ? 'GRATIS' : `${Number(ord.shipping_cost).toFixed(2)}€`}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 mt-1 border-t border-ink/10">
                              <span className="text-[11px] font-black uppercase tracking-widest">Gesamt</span>
                              <span className="font-black text-base">{Number(ord.total).toFixed(2)}€</span>
                            </div>
                          </div>
                          {ord.note && (
                            <p className="mt-2 text-[10px] text-ink/50 italic">Notiz: {ord.note}</p>
                          )}
                          <p className="mt-2 text-[9px] text-ink/30 font-mono">#{ord.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mein Konto */}
          <div className="bg-white border-4 border-ink shadow-brutalist">
            <div className="bg-ink text-white px-5 py-3 flex items-center gap-2">
              <User size={14} />
              <h2 className="font-black text-xs uppercase tracking-widest">Mein Konto</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Kontaktdaten — änderbar */}
              <form onSubmit={saveAccount} className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Kontaktdaten</p>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Ansprechpartner</label>
                  <input type="text" value={acct.contact_name}
                    onChange={e => setAcct(a => ({ ...a, contact_name: e.target.value }))}
                    className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Telefon</label>
                  <input type="tel" value={acct.phone}
                    onChange={e => setAcct(a => ({ ...a, phone: e.target.value }))}
                    className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Straße & Nr.</label>
                  <input type="text" value={acct.street}
                    onChange={e => setAcct(a => ({ ...a, street: e.target.value }))}
                    className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-70">PLZ</label>
                    <input type="text" value={acct.plz}
                      onChange={e => setAcct(a => ({ ...a, plz: e.target.value }))}
                      className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Ort</label>
                    <input type="text" value={acct.city}
                      onChange={e => setAcct(a => ({ ...a, city: e.target.value }))}
                      className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={acctSaving}
                    className="bg-ink text-white px-4 py-2.5 font-black uppercase text-[11px] tracking-wider flex items-center gap-2 hover:bg-tomato transition-all disabled:opacity-30">
                    <Save size={14} /> {acctSaving ? 'Speichert...' : 'Speichern'}
                  </button>
                  {acctMsg && <span className={`text-[11px] font-black ${acctMsg === 'Gespeichert!' ? 'text-olive' : 'text-tomato'}`}>{acctMsg}</span>}
                </div>
              </form>

              {/* Passwort ändern */}
              <form onSubmit={changePassword} className="space-y-3 border-t-2 border-ink/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Passwort ändern</p>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Neues Passwort</label>
                  <input type="password" value={pw.p1} autoComplete="new-password"
                    onChange={e => setPw(p => ({ ...p, p1: e.target.value }))}
                    className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Passwort bestätigen</label>
                  <input type="password" value={pw.p2} autoComplete="new-password"
                    onChange={e => setPw(p => ({ ...p, p2: e.target.value }))}
                    className="w-full border-2 border-ink p-2.5 focus:bg-sun outline-none text-sm" />
                </div>

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={pwSaving}
                    className="bg-ink text-white px-4 py-2.5 font-black uppercase text-[11px] tracking-wider flex items-center gap-2 hover:bg-tomato transition-all disabled:opacity-30">
                    <Lock size={14} /> {pwSaving ? 'Ändert...' : 'Passwort ändern'}
                  </button>
                  {pwMsg && <span className={`text-[11px] font-black ${pwMsg.includes('geändert') ? 'text-olive' : 'text-tomato'}`}>{pwMsg}</span>}
                </div>
              </form>

              {/* Gesperrte Felder — nur durch Kittelwerk änderbar */}
              <div className="border-t-2 border-ink/10 pt-6 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                  <Lock size={11} /> Nur durch Kittelwerk änderbar
                </p>
                <div className="bg-paper border-2 border-ink/15 divide-y divide-ink/10 text-[12px]">
                  <div className="flex justify-between px-3 py-2">
                    <span className="opacity-50">Firma</span>
                    <span className="font-bold text-right">{reseller?.company || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span className="opacity-50">E-Mail (Login)</span>
                    <span className="font-bold text-right break-all">{reseller?.email || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span className="opacity-50">Steuernr. / USt-ID</span>
                    <span className="font-bold text-right">{reseller?.steuer_id || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span className="opacity-50">Händlerrabatt</span>
                    <span className="font-bold text-right">{Number(reseller?.discount_rate || 0).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-[10px] opacity-40 leading-relaxed">
                  Für Änderungen an Firma, Steuernummer oder Rabatt kontaktieren Sie uns bitte direkt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
