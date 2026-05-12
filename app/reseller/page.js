'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { Plus, Trash2, LogOut, CheckCircle, Clock } from 'lucide-react';

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

function getTierPrice(product, qty) {
  let price = product.tiers[0].price;
  for (const tier of product.tiers) {
    if (qty >= tier.minQty) price = tier.price;
  }
  return price;
}

function emptySize() {
  return Object.fromEntries(SIZES.map(s => [s, 0]));
}

export default function ResellerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reseller, setReseller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [items, setItems] = useState([]);
  const [selProd, setSelProd] = useState(PRODUCTS[0].id);
  const [selColor, setSelColor] = useState(PRODUCTS[0].colors[0].name);
  const [selPrint, setSelPrint] = useState('none');
  const [qty, setQty] = useState(10);
  const [sizes, setSizes] = useState(emptySize());
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

      if (!res) { router.push('/reseller/login'); return; }
      setReseller(res);

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
    setSizes(emptySize());
    setQty(10);
  }, [selProd]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/reseller/login');
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
    setSizes(emptySize());
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
              <div className="bg-olive/10 border border-olive/30 px-3 py-2 space-y-0.5">
                <p className="text-[10px] opacity-50 line-through">{itemQty} × {basePrice.toFixed(2)}€ = {(itemQty * basePrice).toFixed(2)}€</p>
                <p className="text-[11px] font-bold text-olive">
                  → {itemQty} × {resellerPrice.toFixed(2)}€ = <strong>{(itemQty * resellerPrice).toFixed(2)}€</strong>
                  <span className="ml-2 text-[9px] opacity-70">({discountRate}% Händlerrabatt)</span>
                </p>
              </div>
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
                  return (
                    <div key={ord.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black">{date} · {totalQty} Stück</p>
                        <p className="text-[10px] opacity-50">{ord.items?.map(i => i.name).join(', ')}</p>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="font-black text-sm">{Number(ord.total).toFixed(2)}€</p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${STATUS_COLORS[ord.status] || STATUS_COLORS.new}`}>
                          {STATUS_LABELS[ord.status] || 'Neu'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
