'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ORDER_STATUS } from '@/lib/portal';
import { ShoppingCart, Plus, Trash2, RefreshCw, CheckCircle, Package } from 'lucide-react';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function printOptions(p) {
  if (p.bestickungOnly) {
    return [
      { value: 'none', label: 'Kein Druck' },
      { value: 'bestickung_front', label: 'Bestickung vorne' },
      { value: 'bestickung_back', label: 'Bestickung hinten' },
      { value: 'bestickung_both', label: 'Bestickung vorne + hinten' },
    ];
  }
  const base = [
    { value: 'none', label: 'Kein Druck' },
    { value: 'front', label: 'DTF Vorderdruck' },
  ];
  if (p.hasBackPrint) {
    base.push({ value: 'back', label: 'DTF Rückendruck' });
    base.push({ value: 'both', label: 'DTF Vorder- & Rückendruck' });
  }
  base.push({ value: 'bestickung_front', label: 'Bestickung vorne' });
  return base;
}

const sizesOf = (p) => (p.hasSizes ? (p.sizes ?? DEFAULT_SIZES) : ['-']);

export default function HaendlerClient({ profile, haendler, products, site }) {
  const istHaendler = profile.role === 'haendler';
  const [lines, setLines] = useState([]);
  const [jobName, setJobName] = useState('');
  const [notes, setNotes] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('id, order_no, status, items, subtotal, shipping_cost, total, job_name, created_at, source')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addLine = () => {
    const p = products[0];
    if (!p) return;
    setLines((prev) => [...prev, {
      key: Math.random().toString(36).slice(2),
      productId: p.id, color: p.colors[0]?.name ?? '', print: 'none',
      sizes: Object.fromEntries(sizesOf(p).map((s) => [s, 0])),
    }]);
  };

  const updateLine = (key, patch) => setLines((prev) => prev.map((l) => {
    if (l.key !== key) return l;
    const next = { ...l, ...patch };
    if (patch.productId && patch.productId !== l.productId) {
      const p = products.find((x) => x.id === patch.productId);
      next.color = p?.colors[0]?.name ?? '';
      next.print = 'none';
      next.sizes = Object.fromEntries(sizesOf(p).map((s) => [s, 0]));
    }
    return next;
  }));

  const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

  // Ekrandaki tahmini tutar. Bağlayıcı hesap sunucuda yapılıyor.
  const preview = useMemo(() => {
    let subtotal = 0;
    const rows = lines.map((l) => {
      const p = products.find((x) => x.id === l.productId);
      const qty = Object.values(l.sizes).reduce((s, v) => s + (Number(v) || 0), 0);
      const tier = [...(p?.tiers ?? [])].sort((a, b) => a.minQty - b.minQty)
        .filter((t) => qty >= t.minQty).pop() ?? p?.tiers?.[0];
      const unit = tier?.price ?? null;
      const line = unit != null ? Math.round(unit * qty * 100) / 100 : 0;
      subtotal += line;
      return { key: l.key, qty, unit, line, minQty: p?.minQty ?? 0, name: p?.name };
    });
    const shipping = subtotal >= 300 ? 0 : subtotal >= 100 ? 14.90 : subtotal > 0 ? 6.90 : 0;
    return { rows, subtotal: Math.round(subtotal * 100) / 100, shipping,
             total: Math.round((subtotal + shipping) * 100) / 100 };
  }, [lines, products]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setSuccess(null);
    const res = await fetch('/api/portal/bestellung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_name: jobName, notes,
        items: lines.map((l) => ({
          productId: l.productId, color: l.color, print: l.print, sizes: l.sizes,
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error ?? 'Bestellung fehlgeschlagen.');
    else {
      setSuccess(data.order_no);
      setLines([]); setJobName(''); setNotes('');
      await load();
    }
    setBusy(false);
  };

  const gesperrt = istHaendler && haendler && !haendler.active;
  // Site siparişi portala devretmediyse burada form gösterme — Wipello'nun
  // siparişi kendi sitesinden geliyor, portal onu yalnızca gösteriyor.
  const bestellbarHier = site?.allows_ordering ?? true;

  return (
    <div className="space-y-8">
      {gesperrt && (
        <p className="rounded-sm border-l-2 border-cch-mint bg-cch-soft/40 p-4 text-sm">
          <strong className="block font-medium uppercase text-[11px] tracking-[0.14em] mb-1">Konto in Prüfung</strong>
          Ihr Händlerkonto ist noch nicht freigegeben. Sobald wir es geprüft haben, können Sie bestellen.
        </p>
      )}

      {istHaendler && haendler?.active && (
        <div className="bg-white rounded-sm shadow-cch p-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><span className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 block">Firma</span>{haendler.company}</div>
          <div><span className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 block">Ihr Rabatt</span>
            <strong className="text-cch-dark">{Number(haendler.discount_rate)} %</strong></div>
          <div className="text-[11px] opacity-60 max-w-sm self-end">
            Alle unten gezeigten Preise sind bereits Ihre Konditionen.
          </div>
        </div>
      )}

      {!istHaendler && (
        <p className="border border-cch-line bg-white p-4 text-sm">
          Sie bestellen hier <strong>im Namen der Firma</strong>. Solche Aufträge laufen als
          <code className="mx-1 text-[12px]">intern</code>, gehen nicht durch die Zahlung und
          zählen nicht als Umsatz. Niemand bestellt im Namen eines anderen.
        </p>
      )}

      {success && (
        <p className="border-4 border-olive bg-olive/10 p-4 text-sm font-bold flex items-center gap-2">
          <CheckCircle size={16} /> Bestellung #{success} ist eingegangen.
        </p>
      )}
      {error && <p className="border-4 border-tomato bg-cch-danger/10 text-cch-danger p-4 text-sm font-bold">{error}</p>}

      {!bestellbarHier && (
        <p className="rounded-sm border-l-2 border-cch-mint bg-cch-soft/40 p-4 text-sm">
          <strong className="block font-medium uppercase text-[11px] tracking-[0.14em] mb-1">
            Nur Ansicht
          </strong>
          Bestellungen für <strong>{site?.name}</strong> entstehen auf der eigenen Seite.
          Im Portal laufen sie nur zusammen — unten sehen Sie sie.
        </p>
      )}

      {!gesperrt && bestellbarHier && (
        <form onSubmit={submit} className="bg-white rounded-sm shadow-cch p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-cch-line pb-3">
            <h2 className="font-medium text-sm uppercase tracking-[0.14em] flex items-center gap-2">
              <ShoppingCart size={16} />Neue Bestellung
            </h2>
            <button type="button" onClick={addLine}
              className="ml-auto border border-cch-line px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] hover:bg-cch-ash flex items-center gap-1.5">
              <Plus size={12} />Position
            </button>
          </div>

          {lines.length === 0 ? (
            <p className="text-sm opacity-50 py-4">Noch keine Positionen. Fügen Sie eine hinzu.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {lines.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                const row = preview.rows.find((r) => r.key === l.key);
                const unter = row.qty > 0 && row.qty < row.minQty;
                return (
                  <div key={l.key} className="border border-cch-line p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Produkt</span>
                        <select value={l.productId} onChange={(e) => updateLine(l.key, { productId: e.target.value })}
                          className="border border-cch-line p-2 text-sm bg-white focus:border-cch-mint outline-none">
                          {products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Farbe</span>
                        <select value={l.color} onChange={(e) => updateLine(l.key, { color: e.target.value })}
                          className="border border-cch-line p-2 text-sm bg-white focus:border-cch-mint outline-none">
                          {(p?.colors ?? []).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Druck</span>
                        <select value={l.print} onChange={(e) => updateLine(l.key, { print: e.target.value })}
                          className="border border-cch-line p-2 text-sm bg-white focus:border-cch-mint outline-none">
                          {printOptions(p ?? {}).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      {sizesOf(p ?? {}).map((s) => (
                        <label key={s} className="flex flex-col gap-1 w-16">
                          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-center">
                            {s === '-' ? 'Stück' : s}
                          </span>
                          <input type="number" min="0" inputMode="numeric"
                            value={l.sizes[s] ?? 0}
                            onChange={(e) => updateLine(l.key, { sizes: { ...l.sizes, [s]: Math.max(0, Number(e.target.value) || 0) } })}
                            className="border border-cch-line p-2 text-sm text-center tabular-nums focus:border-cch-mint outline-none" />
                        </label>
                      ))}

                      <div className="ml-auto text-right">
                        <span className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-50 block">
                          {row.qty} Stück{row.unit != null && ` × ${row.unit.toFixed(2)} €`}
                        </span>
                        <strong className="text-lg tabular-nums">{row.line.toFixed(2)} €</strong>
                      </div>

                      <button type="button" onClick={() => removeLine(l.key)} aria-label="Position entfernen"
                        className="border-2 border-tomato text-cch-danger p-2 hover:bg-cch-danger hover:text-white">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {unter && (
                      <p className="text-[11px] text-cch-danger font-bold">
                        Mindestmenge für {row.name}: {row.minQty} Stück.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Auftragsname (optional)</span>
              <input value={jobName} onChange={(e) => setJobName(e.target.value)}
                className="border border-cch-line p-2.5 text-sm focus:border-cch-mint outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Notiz (optional)</span>
              <input value={notes} onChange={(e) => setNotes(e.target.value)}
                className="border border-cch-line p-2.5 text-sm focus:border-cch-mint outline-none" />
            </label>
          </div>

          {lines.length > 0 && (
            <div className="border-t border-cch-line pt-3 flex flex-wrap items-end justify-between gap-4">
              <dl className="text-sm space-y-1 tabular-nums">
                <div className="flex gap-6"><dt className="opacity-60">Zwischensumme</dt><dd className="ml-auto">{preview.subtotal.toFixed(2)} €</dd></div>
                <div className="flex gap-6"><dt className="opacity-60">Versand</dt><dd className="ml-auto">{preview.shipping === 0 ? 'gratis' : preview.shipping.toFixed(2) + ' €'}</dd></div>
                <div className="flex gap-6 font-medium text-base border-t border-cch-line pt-1"><dt>Gesamt</dt><dd className="ml-auto">{preview.total.toFixed(2)} €</dd></div>
              </dl>
              <button type="submit" disabled={busy}
                className="bg-cch-mint text-white px-6 py-3 text-[11px] font-medium uppercase tracking-[0.14em] hover:bg-tomato shadow-cch disabled:opacity-50">
                {busy ? 'Wird gesendet…' : 'Verbindlich bestellen'}
              </button>
            </div>
          )}
          <p className="text-[10px] opacity-50">
            Der endgültige Preis wird beim Absenden serverseitig neu berechnet.
          </p>
        </form>
      )}

      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-medium text-sm uppercase tracking-[0.14em] flex items-center gap-2">
            <Package size={16} />Meine Bestellungen
          </h2>
          <button onClick={load} disabled={loading}
            className="ml-auto border border-cch-line px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] bg-white hover:bg-cch-ash flex items-center gap-1.5 disabled:opacity-50">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Aktualisieren
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <p className="text-sm opacity-50 py-4">Wird geladen…</p>
        ) : orders.length === 0 ? (
          <p className="border border-dashed border-cch-line p-6 text-sm opacity-50">Noch keine Bestellungen.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o) => {
              const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.neu;
              const items = Array.isArray(o.items) ? o.items : [];
              return (
                <article key={o.id} className="bg-white rounded-sm shadow-cch p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-lg tabular-nums">#{o.order_no}</span>
                    <span className={`text-[9px] font-medium uppercase px-2 py-1 ${st.cls}`}>{st.label}</span>
                    {o.job_name && <span className="text-sm font-bold">{o.job_name}</span>}
                    <span className="text-[11px] opacity-50 tabular-nums">
                      {new Date(o.created_at).toLocaleDateString('de-DE')}
                    </span>
                    <strong className="ml-auto tabular-nums">{Number(o.total).toFixed(2)} €</strong>
                  </div>
                  <ul className="text-[12px] opacity-70 mt-2 space-y-0.5">
                    {items.map((it, i) => (
                      <li key={i}>{it.qty}× {it.product} · {it.color} · {it.print}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
