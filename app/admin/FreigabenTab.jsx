'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { hasPermission } from '@/lib/portal';
import { Check, X, RefreshCw } from 'lucide-react';

// Kayıt olan bayi ve atölyeler pasif gelir; burada onaylanır.
export default function FreigabenTab({ profile, onError }) {
  const [haendler, setHaendler] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const darfHaendler = hasPermission(profile, 'haendler_verwalten');
  const darfWerkstatt = hasPermission(profile, 'werkstatt_verwalten');
  const darfKonditionen = hasPermission(profile, 'haendler_konditionen');

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [res, { data: w }] = await Promise.all([
      darfHaendler || darfKonditionen
        ? fetch('/api/portal/haendler').then((r) => r.json()).catch(() => ({ haendler: [] }))
        : Promise.resolve({ haendler: [] }),
      supabase.from('werkstaetten').select('id, name, contact_name, email, active').order('created_at'),
    ]);
    setHaendler(res.haendler ?? []);
    setShops(w ?? []);
    setLoading(false);
  }, [darfHaendler, darfKonditionen]);

  useEffect(() => { load(); }, [load]);

  const call = async (url, body) => {
    setBusy(body.id);
    const res = await fetch(url, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) onError(data.error ?? 'Aktion fehlgeschlagen.');
    else await load();
    setBusy(null);
  };

  const offeneH = haendler.filter((h) => !h.active);
  const offeneW = shops.filter((s) => !s.active);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">
          {offeneH.length + offeneW.length} offene Freigaben
        </span>
        <button onClick={load} disabled={loading}
          className="ml-auto border-2 border-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-sun flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Aktualisieren
        </button>
      </div>

      <section>
        <h2 className="font-black text-sm uppercase tracking-widest mb-3">Händler</h2>
        {haendler.length === 0 ? (
          <p className="border-2 border-dashed border-ink/30 p-6 text-sm opacity-50">
            Keine Händler sichtbar.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {haendler.map((h) => (
              <article key={h.id} className="border-4 border-ink bg-white shadow-brutalist p-4 flex flex-wrap items-center gap-3">
                <div className="min-w-[12rem]">
                  <strong className="text-sm block">{h.company}</strong>
                  <span className="text-[11px] opacity-60">
                    {h.contact_name && `${h.contact_name} · `}{h.email}
                    {h.city && ` · ${h.plz} ${h.city}`}
                  </span>
                  {h.steuer_id && <span className="text-[10px] opacity-40 block">St-Nr: {h.steuer_id}</span>}
                </div>

                {darfKonditionen && h.discount_rate != null && (
                  <span className="text-[11px] font-black text-olive tabular-nums">
                    {Number(h.discount_rate)} % Rabatt
                  </span>
                )}

                <span className={`text-[9px] font-black uppercase px-2 py-1 border-2
                  ${h.active ? 'border-olive text-olive bg-olive/10' : 'border-sun bg-sun/30'}`}>
                  {h.active ? 'Freigegeben' : 'Wartet'}
                </span>

                {darfHaendler && (
                  <button onClick={() => call('/api/portal/haendler', { id: h.id, active: !h.active })}
                    disabled={busy === h.id}
                    className={`ml-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-40
                      ${h.active ? 'border-2 border-ink hover:bg-sun' : 'bg-ink text-white hover:bg-olive'}`}>
                    {h.active ? <><X size={12} />Sperren</> : <><Check size={12} />Freigeben</>}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-black text-sm uppercase tracking-widest mb-3">Werkstätten</h2>
        <div className="flex flex-col gap-3">
          {shops.map((s) => (
            <article key={s.id} className="border-4 border-ink bg-white shadow-brutalist p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-[12rem]">
                <strong className="text-sm block">{s.name}</strong>
                <span className="text-[11px] opacity-60">
                  {s.contact_name && `${s.contact_name} · `}{s.email}
                </span>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-1 border-2
                ${s.active ? 'border-olive text-olive bg-olive/10' : 'border-sun bg-sun/30'}`}>
                {s.active ? 'Aktiv' : 'Wartet'}
              </span>
              {darfWerkstatt && (
                <button onClick={() => call('/api/portal/werkstatt', { id: s.id, active: !s.active })}
                  disabled={busy === s.id}
                  className={`ml-auto px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-40
                    ${s.active ? 'border-2 border-ink hover:bg-sun' : 'bg-ink text-white hover:bg-olive'}`}>
                  {s.active ? <><X size={12} />Deaktivieren</> : <><Check size={12} />Freigeben</>}
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
