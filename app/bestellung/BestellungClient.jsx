'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ORDER_STATUS, SOURCE_LABELS, KIND_LABELS, siteTone } from '@/lib/portal';
import { RefreshCw, ChevronDown, ChevronUp, Send, Inbox, Factory } from 'lucide-react';

// Vertrieb'in ekranı. Bilerek `orders_produktion` görünümünden okuyor —
// `orders` tablosuna erişimi yok, dolayısıyla fiyatlar buraya hiç gelmiyor.
// Görünümde para sütunu bulunmadığı için ekranda "gizlenecek" bir şey de yok.
// Liste menüde hangi sistemin altından girildiyse ONA kilitli: Kittelwerk'in
// Bestellungen'i yalnız Kittelwerk'i, Wipello'nunki yalnız Wipello'yu gösterir.
// Sistemler arası tek bakış bilerek burada değil, WWS → Tüm Siparişler'de.
export default function BestellungClient({ profile, sites = [], activeSite = null }) {
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

  const siteName = (id) => sites.find((s) => s.id === id)?.name ?? id;
  const sichtbar = activeSite ? orders.filter((o) => o.site_id === activeSite) : orders;
  const offen = sichtbar.filter((o) => !o.werkstatt_id);
  const zugewiesen = sichtbar.filter((o) => o.werkstatt_id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={load} disabled={loading}
          className="border border-cch-line px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] bg-white hover:bg-cch-ash flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Aktualisieren
        </button>
        {/* Seçici yerine hangi sistemde olunduğunu yazan sabit etiket: liste
            artık menüdeki sisteme kilitli, seçilecek bir şey yok. */}
        {activeSite && sites.length > 1 && (
          <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1 rounded-sm ${siteTone(activeSite).badge}`}>
            {siteName(activeSite)}
          </span>
        )}
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-50">
          {offen.length} offen · {zugewiesen.length} zugewiesen
        </span>
      </div>

      {error && (
        <p className="border-4 border-tomato bg-cch-danger/10 text-cch-danger p-4 text-sm font-bold">{error}</p>
      )}

      <Section
        icon={<Inbox size={16} />}
        title="Nicht zugewiesen"
        hint="Diese Aufträge warten auf eine Werkstatt."
        empty="Die Warteschlange ist leer."
        orders={offen}
        openId={openId} setOpenId={setOpenId}
        werkstaetten={werkstaetten} onAssign={assign} busyId={busyId}
        loading={loading} siteName={siteName} mehrereSites={false}
      />

      <Section
        icon={<Factory size={16} />}
        title="In Werkstätten"
        empty="Noch nichts zugewiesen."
        orders={zugewiesen}
        openId={openId} setOpenId={setOpenId}
        werkstaetten={werkstaetten} onAssign={assign} busyId={busyId}
        loading={loading} siteName={siteName} mehrereSites={false}
      />
    </div>
  );
}

function Section({ icon, title, hint, empty, orders, openId, setOpenId, werkstaetten, onAssign, busyId, loading, siteName, mehrereSites }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-medium text-sm uppercase tracking-[0.14em] flex items-center gap-2">
          {icon}{title}
        </h2>
        <span className="text-[11px] font-bold opacity-40">{orders.length}</span>
      </div>
      {hint && <p className="text-[11px] opacity-50 mb-3">{hint}</p>}

      {loading && orders.length === 0 ? (
        <p className="text-sm opacity-50 py-6">Wird geladen…</p>
      ) : orders.length === 0 ? (
        <p className="border border-dashed border-cch-line p-6 text-sm opacity-50">{empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o}
              open={openId === o.id}
              onToggle={() => setOpenId(openId === o.id ? null : o.id)}
              werkstaetten={werkstaetten}
              onAssign={onAssign}
              siteName={siteName} mehrereSites={mehrereSites}
              busy={busyId === o.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderRow({ order, open, onToggle, werkstaetten, onAssign, busy, siteName, mehrereSites }) {
  const [target, setTarget] = useState(order.werkstatt_id ?? '');
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.neu;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const shopName = werkstaetten.find((w) => w.id === order.werkstatt_id)?.name;

  return (
    <article className={`bg-white rounded-sm shadow-cch border-l-2 ${siteTone(order.site_id).border}`}>
      <button onClick={onToggle} aria-expanded={open}
        className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-cch-ash/30 transition-colors">
        <span className="font-medium text-lg tabular-nums">#{order.order_no}</span>
        {mehrereSites && (
          <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1 rounded-sm ${siteTone(order.site_id).badge}`}>
            {siteName(order.site_id)}
          </span>
        )}
        {order.kind === 'angebot' && (
          <span className="text-[9px] font-medium uppercase px-2 py-1 rounded-sm bg-cch-soft text-cch-dark">
            {KIND_LABELS.angebot}
          </span>
        )}
        <span className="font-bold text-sm">{order.company || order.name}</span>
        <span className={`text-[9px] font-medium uppercase px-2 py-1 ${status.cls}`}>{status.label}</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] border border-cch-line px-2 py-0.5">
          {SOURCE_LABELS[order.source] ?? order.source}
        </span>
        <span className="text-[11px] opacity-60 tabular-nums">{totalQty} Stück</span>
        {shopName && <span className="text-[11px] font-bold text-cch-dark">→ {shopName}</span>}
        <span className="ml-auto opacity-40">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>

      {open && (
        <div className="border-t border-cch-line p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 mb-2">Lieferung</h3>
              <p className="text-sm leading-relaxed">
                {order.name}<br />
                {order.company && <>{order.company}<br /></>}
                {order.street}<br />
                {order.plz} {order.city}
                {order.phone && <><br />{order.phone}</>}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 mb-2">Positionen</h3>
              <ul className="text-sm space-y-1">
                {items.map((it, i) => (
                  <li key={i} className="border-b border-cch-line pb-1">
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
            <p className="text-sm border-l-2 border-cch-mint pl-3 opacity-80">{order.notes}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cch-line/10">
            <label htmlFor={`ws-${order.id}`} className="text-[10px] font-medium uppercase tracking-[0.14em]">
              Werkstatt
            </label>
            <select id={`ws-${order.id}`} value={target} onChange={(e) => setTarget(e.target.value)}
              className="border border-cch-line p-2 text-sm bg-white focus:border-cch-mint outline-none">
              <option value="">— wählen —</option>
              {werkstaetten.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button onClick={() => onAssign(order.id, target)}
              disabled={busy || !target || target === order.werkstatt_id}
              className="bg-cch-mint text-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] flex items-center gap-2 hover:bg-tomato transition-colors disabled:opacity-40">
              <Send size={13} />
              {busy ? 'Wird zugewiesen…' : order.werkstatt_id ? 'Umleiten' : 'Zuweisen'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
