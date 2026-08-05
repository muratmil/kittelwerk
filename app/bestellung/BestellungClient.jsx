'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ORDER_STATUS, SOURCE_LABELS } from '@/lib/portal';
import { RefreshCw, ChevronDown, ChevronUp, Send, Inbox, Factory } from 'lucide-react';

// Vertrieb'in ekranı. Bilerek `orders_produktion` görünümünden okuyor —
// `orders` tablosuna erişimi yok, dolayısıyla fiyatlar buraya hiç gelmiyor.
// Görünümde para sütunu bulunmadığı için ekranda "gizlenecek" bir şey de yok.
export default function BestellungClient({ profile }) {
  const [orders, setOrders] = useState([]);
  const [werkstaetten, setWerkstaetten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: rows, error: ordersError }, { data: shops }] = await Promise.all([
      supabase.from('orders_produktion').select('*').order('created_at', { ascending: false }),
      supabase.from('werkstaetten').select('id, name, active').eq('active', true).order('name'),
    ]);
    if (ordersError) setError(ordersError.message);
    setOrders(rows ?? []);
    setWerkstaetten(shops ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const assign = async (orderId, werkstattId) => {
    if (!werkstattId) return;
    setBusyId(orderId);
    setError('');
    const res = await fetch('/api/portal/zuweisen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, werkstatt_id: werkstattId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Zuweisung fehlgeschlagen.');
    } else {
      await load();
    }
    setBusyId(null);
  };

  const offen = orders.filter((o) => !o.werkstatt_id);
  const zugewiesen = orders.filter((o) => o.werkstatt_id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={load} disabled={loading}
          className="border-2 border-ink px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-white hover:bg-sun flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Aktualisieren
        </button>
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">
          {offen.length} offen · {zugewiesen.length} zugewiesen
        </span>
      </div>

      {error && (
        <p className="border-4 border-tomato bg-tomato/10 text-tomato p-4 text-sm font-bold">{error}</p>
      )}

      <Section
        icon={<Inbox size={16} />}
        title="Nicht zugewiesen"
        hint="Diese Aufträge warten auf eine Werkstatt."
        empty="Die Warteschlange ist leer."
        orders={offen}
        openId={openId} setOpenId={setOpenId}
        werkstaetten={werkstaetten} onAssign={assign} busyId={busyId}
        loading={loading}
      />

      <Section
        icon={<Factory size={16} />}
        title="In Werkstätten"
        empty="Noch nichts zugewiesen."
        orders={zugewiesen}
        openId={openId} setOpenId={setOpenId}
        werkstaetten={werkstaetten} onAssign={assign} busyId={busyId}
        loading={loading}
      />
    </div>
  );
}

function Section({ icon, title, hint, empty, orders, openId, setOpenId, werkstaetten, onAssign, busyId, loading }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
          {icon}{title}
        </h2>
        <span className="text-[11px] font-bold opacity-40">{orders.length}</span>
      </div>
      {hint && <p className="text-[11px] opacity-50 mb-3">{hint}</p>}

      {loading && orders.length === 0 ? (
        <p className="text-sm opacity-50 py-6">Wird geladen…</p>
      ) : orders.length === 0 ? (
        <p className="border-2 border-dashed border-ink/30 p-6 text-sm opacity-50">{empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o}
              open={openId === o.id}
              onToggle={() => setOpenId(openId === o.id ? null : o.id)}
              werkstaetten={werkstaetten}
              onAssign={onAssign}
              busy={busyId === o.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderRow({ order, open, onToggle, werkstaetten, onAssign, busy }) {
  const [target, setTarget] = useState(order.werkstatt_id ?? '');
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.neu;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const shopName = werkstaetten.find((w) => w.id === order.werkstatt_id)?.name;

  return (
    <article className="border-4 border-ink bg-white shadow-brutalist">
      <button onClick={onToggle} aria-expanded={open}
        className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-sun/30 transition-colors">
        <span className="font-black text-lg tabular-nums">#{order.order_no}</span>
        <span className="font-bold text-sm">{order.company || order.name}</span>
        <span className={`text-[9px] font-black uppercase px-2 py-1 ${status.cls}`}>{status.label}</span>
        <span className="text-[10px] font-black uppercase tracking-widest border-2 border-ink px-2 py-0.5">
          {SOURCE_LABELS[order.source] ?? order.source}
        </span>
        <span className="text-[11px] opacity-60 tabular-nums">{totalQty} Stück</span>
        {shopName && <span className="text-[11px] font-bold text-olive">→ {shopName}</span>}
        <span className="ml-auto opacity-40">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>

      {open && (
        <div className="border-t-2 border-ink p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Lieferung</h3>
              <p className="text-sm leading-relaxed">
                {order.name}<br />
                {order.company && <>{order.company}<br /></>}
                {order.street}<br />
                {order.plz} {order.city}
                {order.phone && <><br />{order.phone}</>}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Positionen</h3>
              <ul className="text-sm space-y-1">
                {items.map((it, i) => (
                  <li key={i} className="border-b border-ink/10 pb-1">
                    <strong>{it.qty}×</strong> {it.product} · {it.color}
                    <span className="opacity-60"> · {it.print}</span>
                    {it.sizes && (
                      <span className="block text-[11px] opacity-50 tabular-nums">
                        {Object.entries(it.sizes)
                          .filter(([, v]) => v > 0)
                          .map(([k, v]) => (k === '-' ? `${v}` : `${k}×${v}`))
                          .join(' · ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {order.notes && (
            <p className="text-sm border-l-4 border-sun pl-3 opacity-80">{order.notes}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-ink/10">
            <label htmlFor={`ws-${order.id}`} className="text-[10px] font-black uppercase tracking-widest">
              Werkstatt
            </label>
            <select id={`ws-${order.id}`} value={target} onChange={(e) => setTarget(e.target.value)}
              className="border-2 border-ink p-2 text-sm bg-white focus:bg-sun outline-none">
              <option value="">— wählen —</option>
              {werkstaetten.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button onClick={() => onAssign(order.id, target)}
              disabled={busy || !target || target === order.werkstatt_id}
              className="bg-ink text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-tomato transition-colors disabled:opacity-40">
              <Send size={13} />
              {busy ? 'Wird zugewiesen…' : order.werkstatt_id ? 'Umleiten' : 'Zuweisen'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
