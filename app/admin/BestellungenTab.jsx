'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ORDER_STATUS, SOURCE_LABELS, KIND_LABELS, hasPermission, siteTone } from '@/lib/portal';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function BestellungenTab({ profile, sites = [] }) {
  const [siteFilter, setSiteFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const darfPreise = hasPermission(profile, 'preise_sehen');

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: o }, { data: w }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('werkstaetten').select('id, name'),
    ]);
    setOrders(o ?? []);
    setShops(w ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const gefiltert = siteFilter ? orders.filter((o) => o.site_id === siteFilter) : orders;
  const summe = gefiltert.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const siteName = (id) => sites.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={load} disabled={loading}
          className="border border-cch-line px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] bg-white hover:bg-cch-ash flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Aktualisieren
        </button>
        {sites.length > 1 && (
          <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}
            className="border border-cch-line p-2 text-[11px] font-medium uppercase tracking-[0.14em] bg-white focus:border-cch-mint outline-none">
            <option value="">Alle Seiten</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-50">
          {gefiltert.length} Bestellungen
          {darfPreise && ` · ${summe.toFixed(2)} €`}
        </span>
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-sm opacity-50 py-6">Wird geladen…</p>
      ) : orders.length === 0 ? (
        <p className="border border-dashed border-cch-line p-6 text-sm opacity-50">
          Noch keine Bestellungen — oder Ihnen fehlt die Berechtigung „Alle Bestellungen sehen“.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {gefiltert.map((o) => {
            const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.neu;
            const items = Array.isArray(o.items) ? o.items : [];
            const shop = shops.find((s) => s.id === o.werkstatt_id);
            const open = openId === o.id;
            // Hangi sistemden geldiği sol kenardaki tondan anlaşılıyor;
            // rozet okumadan da liste taranabilsin diye.
            const ton = siteTone(o.site_id);
            return (
              <article key={o.id} className={`bg-white rounded-sm shadow-cch border-l-2 ${ton.border}`}>
                <button onClick={() => setOpenId(open ? null : o.id)} aria-expanded={open}
                  className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-cch-ash/30">
                  <span className="font-medium text-lg tabular-nums">#{o.order_no}</span>
                  {sites.length > 1 && (
                    <span className={`text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-1 rounded-sm ${ton.badge}`}>
                      {siteName(o.site_id)}
                    </span>
                  )}
                  {o.kind === 'angebot' && (
                    <span className="text-[9px] font-medium uppercase px-2 py-1 rounded-sm bg-cch-soft text-cch-dark">
                      {KIND_LABELS.angebot}{o.external_ref ? ` ${o.external_ref}` : ''}
                    </span>
                  )}
                  <span className="font-bold text-sm">{o.company || o.name}</span>
                  <span className={`text-[9px] font-medium uppercase px-2 py-1 ${st.cls}`}>{st.label}</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] border border-cch-line px-2 py-0.5">
                    {SOURCE_LABELS[o.source] ?? o.source}
                  </span>
                  {shop && <span className="text-[11px] font-bold text-cch-dark">→ {shop.name}</span>}
                  {darfPreise && <strong className="ml-auto tabular-nums">{Number(o.total).toFixed(2)} €</strong>}
                  <span className="opacity-40">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </button>

                {open && (
                  <div className="border-t border-cch-line p-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 mb-1">Kunde</h3>
                      <p className="text-sm leading-relaxed">
                        {o.name}{o.company && <> · {o.company}</>}<br />
                        {o.street && <>{o.street}<br /></>}
                        {o.plz} {o.city}
                        {o.email && <><br />{o.email}</>}
                      </p>
                      {o.job_name && <p className="text-sm mt-2"><strong>Auftrag:</strong> {o.job_name}</p>}
                      {o.notes && <p className="text-sm mt-2 border-l-2 border-cch-mint pl-2">{o.notes}</p>}
                    </div>
                    <div>
                      <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 mb-1">Positionen</h3>
                      <ul className="text-sm space-y-1">
                        {items.map((it, i) => (
                          <li key={i} className="border-b border-cch-line pb-1 flex gap-2">
                            <span><strong>{it.qty}×</strong> {it.product} · {it.color}</span>
                            {darfPreise && it.linePrice != null && (
                              <span className="ml-auto tabular-nums">{Number(it.linePrice).toFixed(2)} €</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {darfPreise && (
                        <dl className="text-sm mt-3 space-y-0.5 tabular-nums">
                          <div className="flex"><dt className="opacity-60">Zwischensumme</dt><dd className="ml-auto">{Number(o.subtotal).toFixed(2)} €</dd></div>
                          {Number(o.discount_amount) > 0 && (
                            <div className="flex text-cch-dark"><dt>Rabatt</dt><dd className="ml-auto">−{Number(o.discount_amount).toFixed(2)} €</dd></div>
                          )}
                          <div className="flex"><dt className="opacity-60">Versand</dt><dd className="ml-auto">{Number(o.shipping_cost).toFixed(2)} €</dd></div>
                          {o.net_total != null && (
                            <>
                              <div className="flex"><dt className="opacity-60">Netto</dt><dd className="ml-auto">{Number(o.net_total).toFixed(2)} €</dd></div>
                              <div className="flex"><dt className="opacity-60">MwSt. {Number(o.vat_rate)} %</dt><dd className="ml-auto">{Number(o.vat_amount).toFixed(2)} €</dd></div>
                            </>
                          )}
                          <div className="flex font-medium border-t border-cch-line pt-1"><dt>Gesamt</dt><dd className="ml-auto">{Number(o.total).toFixed(2)} €</dd></div>
                          {o.cost_total != null && (
                            <div className="flex text-[11px] opacity-60">
                              <dt>Wareneinsatz (eingefroren)</dt><dd className="ml-auto">{Number(o.cost_total).toFixed(2)} €</dd>
                            </div>
                          )}
                        </dl>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
