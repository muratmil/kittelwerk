'use client';
import { useState } from 'react';
import { hasPermission } from '@/lib/portal';
import { isLowMargin } from '@/lib/pricing';
import { TrendingUp, AlertTriangle, Save, Coins } from 'lucide-react';

const eur = (v) => (v == null ? '—' : `${Number(v).toFixed(2)} €`);

// Fiyat ekranı. Her satır iki modu HEM gösteriyor HEM seçtiriyor, ve elle
// fiyatlanan ürünün GERÇEKLEŞEN MARJINI yanına yazıyor — Kittelwerk'te tüm
// ürünler elle fiyatlandığı için maliyet artışına karşı tek koruma bu sütun.
export default function PreiseTab({ profile, catalog, onChange, onRate, onSettings, siteName }) {
  const darfPflegen = hasPermission(profile, 'preise_pflegen');
  const { products, settings, rates, rateByCurrency } = catalog;
  const [busy, setBusy] = useState(null);

  const [neuerKurs, setNeuerKurs] = useState({ currency: 'TRY', rate: '' });
  const [rundung, setRundung] = useState({
    round_to: settings.round_to ?? 1,
    round_mode: settings.round_mode ?? 'up',
    low_margin_threshold: settings.low_margin_threshold ?? 35,
  });

  const niedrig = products.filter((p) => {
    const m = p.staffel?.[0]?.margin;
    return isLowMargin(m, settings);
  });

  return (
    <div className="space-y-8">
      {niedrig.length > 0 && (
        <p className="border-4 border-tomato bg-tomato/10 p-4 text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-tomato" />
          <span>
            <strong className="block font-black uppercase text-[11px] tracking-widest mb-1 text-tomato">
              Marge unter {Number(settings.low_margin_threshold ?? 35)} %
            </strong>
            {niedrig.map((p) => p.name).join(', ')} — handgesetzte Preise korrigieren sich
            nicht von selbst, wenn der Einkauf teurer wird.
          </span>
        </p>
      )}

      {/* --------------------------------------------------------- kur */}
      <section className="border-4 border-ink bg-white shadow-brutalist p-5 space-y-4">
        <h2 className="font-black text-sm uppercase tracking-widest border-b-2 border-ink pb-2 flex items-center gap-2">
          <Coins size={16} />Wechselkurse
        </h2>
        <p className="text-[11px] opacity-60 leading-relaxed">
          Kurse werden <strong>nie überschrieben</strong> — jede Änderung ist eine neue Zeile.
          Nur so bleiben Kosten und Marge alter Bestellungen richtig.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest">Währung</span>
            <input value={neuerKurs.currency} onChange={(e) => setNeuerKurs((k) => ({ ...k, currency: e.target.value.toUpperCase() }))}
              className="border-2 border-ink p-2 text-sm w-24 focus:bg-sun outline-none" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest">Kurs → EUR</span>
            <input type="number" step="0.0001" value={neuerKurs.rate}
              onChange={(e) => setNeuerKurs((k) => ({ ...k, rate: e.target.value }))}
              placeholder="0,0244"
              className="border-2 border-ink p-2 text-sm w-36 tabular-nums focus:bg-sun outline-none" />
          </label>
          <button onClick={async () => { setBusy('kurs'); await onRate(neuerKurs); setNeuerKurs((k) => ({ ...k, rate: '' })); setBusy(null); }}
            disabled={busy === 'kurs' || !neuerKurs.rate}
            className="bg-ink text-white px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-tomato disabled:opacity-40">
            Kurs erfassen
          </button>
          <span className="text-[11px] opacity-60 ml-auto">
            Aktuell: {Object.entries(rateByCurrency).map(([c, r]) => `1 ${c} = ${r} €`).join(' · ') || '—'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">Währung</th>
                <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">Kurs</th>
                <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">Gültig ab</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-ink/10">
                  <td className="py-1.5">{r.currency}</td>
                  <td className="py-1.5 tabular-nums">{Number(r.rate)}</td>
                  <td className="py-1.5 tabular-nums opacity-60">
                    {new Date(r.valid_from).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------- yuvarlama */}
      {darfPflegen && (
        <section className="border-4 border-ink bg-white shadow-brutalist p-5 space-y-4">
          <h2 className="font-black text-sm uppercase tracking-widest border-b-2 border-ink pb-2">
            Rundung
          </h2>
          <p className="text-[11px] opacity-60 leading-relaxed">
            Gilt nur für berechnete Preise (Marge-Modus). Der Schritt ist einstellbar, weil
            „aufwärts auf volle Euro“ bei Cent-Artikeln den Preis vervielfachen würde.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Schritt</span>
              <input type="number" step="0.01" value={rundung.round_to}
                onChange={(e) => setRundung((r) => ({ ...r, round_to: e.target.value }))}
                className="border-2 border-ink p-2 text-sm w-28 tabular-nums focus:bg-sun outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Richtung</span>
              <select value={rundung.round_mode}
                onChange={(e) => setRundung((r) => ({ ...r, round_mode: e.target.value }))}
                className="border-2 border-ink p-2 text-sm bg-white focus:bg-sun outline-none">
                <option value="up">aufwärts</option>
                <option value="nearest">kaufmännisch</option>
                <option value="down">abwärts</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Marge-Warnung ab</span>
              <input type="number" step="1" value={rundung.low_margin_threshold}
                onChange={(e) => setRundung((r) => ({ ...r, low_margin_threshold: e.target.value }))}
                className="border-2 border-ink p-2 text-sm w-24 tabular-nums focus:bg-sun outline-none" />
            </label>
            <button onClick={async () => { setBusy('set'); await onSettings(rundung); setBusy(null); }}
              disabled={busy === 'set'}
              className="border-2 border-ink px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-sun flex items-center gap-2 disabled:opacity-40">
              <Save size={13} />Speichern
            </button>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ ürünler */}
      <section className="space-y-3">
        <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
          <TrendingUp size={16} />Produkte & Preise
          {siteName && <span className="text-[10px] border-2 border-ink px-2 py-0.5">{siteName}</span>}
        </h2>
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProduktZeile key={p.id} product={p} settings={settings}
              darfPflegen={darfPflegen} darfKosten={darfPflegen || profile.role === 'vertrieb'}
              onChange={onChange} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProduktZeile({ product, settings, darfPflegen, darfKosten, onChange }) {
  const [open, setOpen] = useState(false);
  const [cost, setCost] = useState(product.costPrice ?? '');
  const [busy, setBusy] = useState(false);

  const erste = product.staffel?.[0];
  const margin = erste?.margin;
  const niedrig = isLowMargin(margin, settings);
  const manuell = product.priceMode === 'manuell';

  return (
    <article className="border-4 border-ink bg-white shadow-brutalist">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-sun/30 transition-colors">
        <span className="font-bold text-sm min-w-[10rem]">{product.name}</span>
        {product.comingSoon && (
          <span className="text-[9px] font-black uppercase px-2 py-1 bg-ink/10">Bald</span>
        )}

        <span className={`text-[9px] font-black uppercase px-2 py-1 border-2
          ${manuell ? 'border-ink bg-white' : 'border-sun bg-sun/30'}`}>
          {manuell ? '✏ Elle' : '⚙ Marge'}
        </span>

        <span className="text-[11px] opacity-60 tabular-nums">
          EK {product.costPrice != null ? `${Number(product.costPrice)} ${product.costCurrency}` : '—'}
          {erste?.costEur != null && ` = ${eur(erste.costEur)}`}
        </span>

        <span className="font-black tabular-nums">{eur(erste?.price)}</span>

        <span className={`text-[11px] font-black tabular-nums ${niedrig ? 'text-tomato' : 'text-olive'}`}>
          {margin != null ? `${margin} %` : 'Marge unbekannt'}
          {niedrig && ' ⚠'}
        </span>
      </button>

      {open && (
        <div className="border-t-2 border-ink p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            {darfKosten && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Einkaufspreis ({product.costCurrency})
                  </span>
                  <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                    className="border-2 border-ink p-2 text-sm w-32 tabular-nums focus:bg-sun outline-none" />
                </label>
                <button onClick={async () => { setBusy(true); await onChange({ art: 'kosten', id: product.id, cost_price: cost }); setBusy(false); }}
                  disabled={busy}
                  className="border-2 border-ink px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-sun disabled:opacity-40">
                  Einkauf speichern
                </button>
              </>
            )}

            {darfPflegen && (
              <label className="flex flex-col gap-1 ml-auto">
                <span className="text-[10px] font-black uppercase tracking-widest">Preismodus</span>
                <select value={product.priceMode}
                  onChange={(e) => onChange({ art: 'produkt', id: product.id, price_mode: e.target.value })}
                  className="border-2 border-ink p-2 text-sm bg-white focus:bg-sun outline-none">
                  <option value="manuell">Elle (Handpreis)</option>
                  <option value="marge">Marge (berechnet)</option>
                </select>
              </label>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b-2 border-ink text-left">
                  <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">ab Menge</th>
                  <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">Verkaufspreis</th>
                  <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">Quelle</th>
                  <th className="py-1.5 text-[10px] font-black uppercase tracking-widest opacity-50">Marge</th>
                </tr>
              </thead>
              <tbody>
                {(product.staffel ?? []).map((s) => (
                  <StaffelZeile key={s.minQty} productId={product.id} row={s}
                    settings={settings} darfPflegen={darfPflegen} onChange={onChange} />
                ))}
              </tbody>
            </table>
          </div>

          {manuell && (
            <p className="text-[11px] opacity-60 leading-relaxed">
              Im Marge-Modus würde der Preis aus Einkauf × Kurs × Marge berechnet und
              automatisch mitziehen, wenn der Einkauf teurer wird. Handpreise tun das nicht —
              deshalb die Marge-Spalte im Auge behalten.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function StaffelZeile({ productId, row, settings, darfPflegen, onChange }) {
  const [value, setValue] = useState(row.price ?? '');
  const [busy, setBusy] = useState(false);
  const niedrig = isLowMargin(row.margin, settings);

  const save = async () => {
    if (String(value) === String(row.price ?? '')) return;
    setBusy(true);
    await onChange({ art: 'staffel', product_id: productId, min_qty: row.minQty, price: value });
    setBusy(false);
  };

  return (
    <tr className="border-b border-ink/10">
      <td className="py-1.5 tabular-nums">{row.minQty}</td>
      <td className="py-1.5">
        {darfPflegen ? (
          <input type="number" step="0.01" value={value} disabled={busy}
            onChange={(e) => setValue(e.target.value)} onBlur={save}
            className="border-2 border-ink p-1.5 text-[12px] w-24 tabular-nums focus:bg-sun outline-none disabled:opacity-50" />
        ) : (
          <span className="tabular-nums">{eur(row.price)}</span>
        )}
      </td>
      <td className="py-1.5 text-[11px] opacity-60">{row.source === 'marge' ? 'berechnet' : 'Handpreis'}</td>
      <td className={`py-1.5 tabular-nums font-bold ${niedrig ? 'text-tomato' : 'text-olive'}`}>
        {row.margin != null ? `${row.margin} %` : '—'}{niedrig && ' ⚠'}
      </td>
    </tr>
  );
}
