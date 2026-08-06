'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ORDER_STATUS, siteTone } from '@/lib/portal';
import { RefreshCw, Printer, Download } from 'lucide-react';

// Atölye ekranı. Aynı parasız görünümden okuyor; satır süzgeci veritabanında,
// bu yüzden başka atölyenin işini istese de çekemez.
export default function WerkstattClient({ profile, sites = [] }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('orders_produktion')
      .select('*')
      .in('status', ['neu', 'in_produktion', 'pausiert'])
      .order('created_at', { ascending: true });
    setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button onClick={load} disabled={loading}
          className="border border-cch-line px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] bg-white hover:bg-cch-ash flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Aktualisieren
        </button>
        <button onClick={() => window.print()}
          className="border border-cch-line px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] bg-white hover:bg-cch-ash flex items-center gap-2">
          <Printer size={13} />
          Drucken
        </button>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-50">
          {orders.length} aktive Aufträge
        </span>
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-sm opacity-50 py-6">Wird geladen…</p>
      ) : orders.length === 0 ? (
        <p className="border border-dashed border-cch-line p-8 text-sm opacity-50">
          Keine aktiven Aufträge. Neue Aufträge erscheinen hier, sobald sie zugewiesen werden.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((o) => (
            <JobCard key={o.id} order={o}
              siteName={sites.find((s) => s.id === o.site_id)?.name}
              mehrereSites={sites.length > 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ order, siteName, mehrereSites }) {
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.neu;
  const items = Array.isArray(order.items) ? order.items : [];
  const ton = siteTone(order.site_id);

  return (
    <article className={`bg-white rounded-sm shadow-cch break-inside-avoid border-l-2 ${ton.border}`}>
      <header className="flex flex-wrap items-center gap-3 p-4 border-b border-cch-line">
        <span className="font-medium text-xl tabular-nums">#{order.order_no}</span>
        {mehrereSites && siteName && (
          <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1 rounded-sm ${ton.badge}`}>
            {siteName}
          </span>
        )}
        <span className={`text-[9px] font-medium uppercase px-2 py-1 ${status.cls}`}>{status.label}</span>
        <span className="ml-auto text-[11px] opacity-50 tabular-nums">
          {new Date(order.created_at).toLocaleDateString('de-DE')}
        </span>
      </header>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 mb-1">Versand an</h3>
          <p className="text-sm leading-relaxed">
            {order.name}{order.company && <> · {order.company}</>}<br />
            {order.street}, {order.plz} {order.city}
          </p>
        </div>

        <div>
          <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 mb-1">Produktion</h3>
          <table className="w-full text-sm">
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-cch-line">
                  <td className="py-1 font-bold tabular-nums w-12">{it.qty}×</td>
                  <td className="py-1">
                    {it.product}
                    <span className="block text-[11px] opacity-60">
                      {it.color} · {it.print}
                      {it.sizes && ' · ' + Object.entries(it.sizes)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => (k === '-' ? `${v}` : `${k}×${v}`))
                        .join(' · ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.notes && (
          <p className="text-sm border-l-2 border-cch-mint pl-3">{order.notes}</p>
        )}

        {order.logo_url && (
          <a href={order.logo_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 border border-cch-line px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] hover:bg-cch-ash print:hidden">
            <Download size={13} /> Logo
          </a>
        )}
      </div>
    </article>
  );
}
