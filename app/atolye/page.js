'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Printer, LogOut } from 'lucide-react';
import Image from 'next/image';

const PRINT_LABELS = {
  none:  'Kein Druck',
  front: 'Vorderdruck',
  back:  'Rückendruck',
  both:  'Vorder- + Rückendruck',
};

const STATUS_LABELS = {
  new:        'Neu',
  processing: 'In Bearbeitung',
  shipped:    'Versandt',
  done:       'Abgeschlossen',
  cancelled:  'Storniert',
};

const STATUS_COLORS = {
  new:        'bg-sun text-ink',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-olive/20 text-olive',
  done:       'bg-ink/10 text-ink/50',
  cancelled:  'bg-tomato/10 text-tomato',
};

function formatSizes(sizes) {
  if (!sizes || sizes['-'] !== undefined) return `${sizes?.['-'] ?? '—'} Stück`;
  return Object.entries(sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' · ');
}

function OrderCard({ order }) {
  const date = new Date(order.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const status = order.status || 'new';
  const totalQty = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;

  return (
    <div className="border-4 border-ink bg-white shadow-brutalist-lg print:shadow-none print:border-2 print:break-inside-avoid">
      {/* Header */}
      <div className="bg-ink text-white px-5 py-3 flex justify-between items-center">
        <div>
          <span className="font-black text-lg uppercase">{order.company}</span>
          <span className="text-[10px] opacity-60 ml-3">{date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black opacity-60">#{order.id.slice(0,8)}</span>
          <span className={`text-[9px] font-black uppercase px-2 py-1 ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Üretim tablosu */}
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Produkt</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Farbe</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Größen</th>
              <th className="pb-2 text-center text-[9px] font-black uppercase opacity-50">Menge</th>
              <th className="pb-2 text-left text-[9px] font-black uppercase opacity-50">Druck</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i} className="border-b border-ink/10">
                <td className="py-2.5 font-black">{item.name}</td>
                <td className="py-2.5">
                  <span className="flex items-center gap-1.5">
                    {item.color}
                  </span>
                </td>
                <td className="py-2.5 font-mono text-[11px]">{formatSizes(item.sizes)}</td>
                <td className="py-2.5 text-center font-black text-base">{item.qty}</td>
                <td className="py-2.5">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${item.printType && item.printType !== 'none' ? 'bg-tomato text-white' : 'bg-ink/10 text-ink/40'}`}>
                    {PRINT_LABELS[item.printType] || 'Kein Druck'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink">
              <td colSpan={3} className="pt-2 text-[9px] font-black uppercase opacity-50">Gesamt</td>
              <td className="pt-2 text-center font-black text-xl">{totalQty}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* Logo & Notizen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border-2 border-dashed border-ink/30 p-3 bg-paper">
            <p className="text-[9px] font-black uppercase opacity-50 mb-1">Logo</p>
            <p className="text-[11px] font-bold">
              {order.notes?.toLowerCase().includes('logo') ? '→ Siehe Notiz' : 'Per E-Mail / im Anhang der Bestellung'}
            </p>
          </div>

          {order.notes ? (
            <div className="border-2 border-sun bg-sun/20 p-3">
              <p className="text-[9px] font-black uppercase mb-1">Notiz</p>
              <p className="text-[12px] font-bold whitespace-pre-wrap">{order.notes}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-ink/20 p-3 flex items-center justify-center">
              <p className="text-[10px] opacity-30 uppercase font-black">Keine Notiz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AtolyePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/atolye/login');
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .not('status', 'in', '("done","cancelled")')
      .order('created_at', { ascending: true });
    setOrders(data || []);
    setLoading(false);
    setLastUpdated(new Date().toLocaleTimeString('de-DE'));
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="min-h-screen bg-paper print:bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-ink px-6 py-4 flex justify-between items-center print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Kittelwerk" width={130} height={36} className="h-8 w-auto object-contain" />
            <span className="font-serif font-black text-sm italic uppercase opacity-50">Atölye</span>
          </div>
          {lastUpdated && <p className="text-[9px] opacity-40 uppercase mt-0.5">Zuletzt aktualisiert: {lastUpdated}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders}
            className="p-2 border-2 border-ink hover:bg-sun transition-all" title="Aktualisieren">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-sun transition-all">
            <Printer size={14} /> Drucken
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2 border-2 border-ink hover:bg-tomato hover:text-white transition-all">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:flex justify-between items-center px-6 py-4 border-b-2 border-ink mb-4">
        <span className="font-serif font-black text-xl italic uppercase">Kittelwerk — Atölye</span>
        <span className="text-[10px]">{new Date().toLocaleDateString('de-DE')}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-20 font-serif italic opacity-40 uppercase">Wird geladen...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="font-serif font-black text-2xl italic opacity-30 uppercase">Keine aktiven Bestellungen</p>
            <p className="text-[11px] opacity-30">Alle Bestellungen sind abgeschlossen oder storniert.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between print:hidden">
              <p className="text-[10px] font-black uppercase opacity-50">
                {orders.length} aktive Bestellung{orders.length !== 1 ? 'en' : ''}
              </p>
            </div>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
