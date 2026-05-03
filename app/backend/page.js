'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, Package, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'new',        label: 'Neu',             color: 'bg-sun text-ink' },
  { value: 'processing', label: 'In Bearbeitung',  color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped',    label: 'Versandt',         color: 'bg-olive/20 text-olive' },
  { value: 'done',       label: 'Abgeschlossen',    color: 'bg-ink/10 text-ink/50' },
  { value: 'cancelled',  label: 'Storniert',        color: 'bg-tomato/10 text-tomato' },
];

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`text-[9px] font-black uppercase px-2 py-1 ${opt.color}`}>
      {opt.label}
    </span>
  );
}

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status || 'new');
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setStatus(newStatus);
    setUpdating(false);
  };

  const date = new Date(order.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className={`border-2 border-ink bg-white transition-all ${open ? 'shadow-brutalist' : ''}`}>
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-black text-sm uppercase">{order.company}</span>
            <span className="text-[10px] opacity-50">{order.name}</span>
            <span className="text-[10px] opacity-40 hidden sm:inline">{date}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <StatusBadge status={status} />
            <span className="text-[10px] opacity-50">{order.items?.length || 0} Positionen</span>
            <span className="text-[10px] font-black">{Number(order.total).toFixed(2)}€</span>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="flex-shrink-0 opacity-50" /> : <ChevronDown size={16} className="flex-shrink-0 opacity-50" />}
      </div>

      {open && (
        <div className="border-t-2 border-ink p-4 space-y-4 bg-paper">
          {/* Kontakt */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
            <div><span className="opacity-50 uppercase font-black">E-Mail</span><br /><a href={`mailto:${order.email}`} className="text-tomato font-bold">{order.email}</a></div>
            <div><span className="opacity-50 uppercase font-black">Telefon</span><br />{order.phone}</div>
            <div className="col-span-2"><span className="opacity-50 uppercase font-black">Adresse</span><br />{order.street}, {order.plz} {order.city}</div>
            {order.discount_code && (
              <div><span className="opacity-50 uppercase font-black">Rabatt</span><br />{order.discount_code} (−{Number(order.discount_amount).toFixed(2)}€)</div>
            )}
          </div>

          {/* Bestellpositionen */}
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-ink text-white">
                <th className="p-2 text-left font-black uppercase">Produkt</th>
                <th className="p-2 text-left font-black uppercase">Farbe · Größe</th>
                <th className="p-2 text-center font-black uppercase">Menge</th>
                <th className="p-2 text-right font-black uppercase">Preis</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i} className="border-b border-ink/10">
                  <td className="p-2 font-bold">{item.name}</td>
                  <td className="p-2 opacity-70">{item.color} · {formatSizes(item.sizes)}</td>
                  <td className="p-2 text-center">{item.qty}</td>
                  <td className="p-2 text-right font-black">{(item.price * item.qty).toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summen */}
          <div className="flex justify-end">
            <div className="space-y-1 text-[11px] min-w-[200px]">
              <div className="flex justify-between"><span className="opacity-60">Zwischensumme</span><span>{Number(order.subtotal).toFixed(2)}€</span></div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-olive"><span>Rabatt</span><span>−{Number(order.discount_amount).toFixed(2)}€</span></div>
              )}
              <div className="flex justify-between"><span className="opacity-60">Versand</span><span>{Number(order.shipping_cost) === 0 ? 'GRATIS' : Number(order.shipping_cost).toFixed(2) + '€'}</span></div>
              <div className="flex justify-between font-black text-base border-t-2 border-ink pt-1"><span>TOTAL</span><span>{Number(order.total).toFixed(2)}€</span></div>
            </div>
          </div>

          {/* Status ändern */}
          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-ink/20">
            <span className="text-[9px] font-black uppercase opacity-50 self-center">Status:</span>
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleStatus(opt.value)}
                disabled={updating || status === opt.value}
                className={`text-[9px] font-black uppercase px-3 py-1.5 border-2 border-ink transition-all
                  ${status === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun disabled:opacity-40'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/backend/login'); return; }
      setUserEmail(user.email);
    });
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/backend/login');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => (o.status || 'new') === filter);

  const counts = STATUS_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = orders.filter(o => (o.status || 'new') === opt.value).length;
    return acc;
  }, { all: orders.length });

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-white border-b-4 border-ink px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package size={20} />
          <span className="font-serif font-black text-xl italic uppercase">
            Kittel<span className="text-tomato">werk</span>. Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] opacity-50 hidden sm:block">{userEmail}</span>
          <button onClick={fetchOrders} className="p-2 border-2 border-ink hover:bg-sun transition-all" title="Aktualisieren">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-tomato hover:text-white transition-all">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Gesamt', value: orders.length, color: 'bg-ink text-white' },
            { label: 'Neu', value: counts.new || 0, color: 'bg-sun text-ink' },
            { label: 'In Bearbeitung', value: counts.processing || 0, color: 'bg-blue-100 text-blue-800' },
            { label: 'Versandt', value: counts.shipped || 0, color: 'bg-olive/20 text-olive' },
          ].map(stat => (
            <div key={stat.label} className={`border-2 border-ink p-4 shadow-brutalist ${stat.color}`}>
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-[9px] font-black uppercase opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')}
            className={`text-[9px] font-black uppercase px-3 py-2 border-2 border-ink transition-all ${filter === 'all' ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
            Alle ({orders.length})
          </button>
          {STATUS_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)}
              className={`text-[9px] font-black uppercase px-3 py-2 border-2 border-ink transition-all ${filter === opt.value ? 'bg-ink text-white' : 'bg-paper hover:bg-sun'}`}>
              {opt.label} ({counts[opt.value] || 0})
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="text-center py-20 font-serif italic opacity-40 uppercase">Wird geladen...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 font-serif italic opacity-40 uppercase">Keine Bestellungen</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
