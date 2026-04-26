'use client';
import { useState } from 'react';

const PRODUCTS = [
  { label: 'T-Shirt', old: 20, new: 10, key: 'tshirt', default: 20 },
  { label: 'Latzschürze', old: 17, new: 10, key: 'latz', default: 15 },
  { label: 'Schürze', old: 15, new: 8, key: 'apron', default: 10 },
  { label: 'Kappe', old: 14, new: 7, key: 'cap', default: 10 },
  { label: 'Sweatshirt', old: 30, new: 14, key: 'sweat', default: 10 },
];

export default function Calculator() {
  const [qtys, setQtys] = useState(
    Object.fromEntries(PRODUCTS.map(p => [p.key, p.default]))
  );

  const totalOld = PRODUCTS.reduce((s, p) => s + p.old * (qtys[p.key] || 0), 0);
  const totalNew = PRODUCTS.reduce((s, p) => s + p.new * (qtys[p.key] || 0), 0);
  const savings = totalOld - totalNew;
  const pct = totalOld > 0 ? ((savings / totalOld) * 100).toFixed(0) : 0;

  return (
    <section id="rechner" className="py-24 bg-sun border-t-4 border-b-4 border-ink">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Live-Rechner —</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            Was <span className="text-tomato">sparen</span> Sie?
          </h2>
          <p className="mt-3 text-sm font-medium opacity-70">Lagerpreise vs. deutsche Marktpreise — live berechnet.</p>
        </div>

        <div className="bg-paper border-4 border-ink shadow-brutalist-lg p-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Stückzahlen eingeben</p>
              {PRODUCTS.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium flex-1">
                    {p.label} <span className="opacity-50 text-xs">({p.old}€→{p.new}€)</span>
                  </span>
                  <div className="flex items-center border-2 border-ink">
                    <button onClick={() => setQtys(q => ({ ...q, [p.key]: Math.max(0, (q[p.key] || 0) - 1) }))}
                      className="px-2 py-1 hover:bg-sun font-bold text-sm w-8 text-center">−</button>
                    <input type="number" min="0" max="100"
                      value={qtys[p.key]}
                      onChange={e => setQtys(q => ({ ...q, [p.key]: Math.max(0, Math.min(100, +e.target.value || 0)) }))}
                      className="w-14 text-center font-black text-sm border-x-2 border-ink py-1 bg-paper outline-none" />
                    <button onClick={() => setQtys(q => ({ ...q, [p.key]: Math.min(100, (q[p.key] || 0) + 1) }))}
                      className="px-2 py-1 hover:bg-sun font-bold text-sm w-8 text-center">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-ink text-white p-6 flex flex-col justify-center">
              <p className="text-[9px] uppercase tracking-widest text-sun mb-2">Ihre Ersparnis</p>
              <p className="font-serif font-black text-5xl text-sun leading-none">{savings.toFixed(0)} €</p>
              <p className="text-xs opacity-60 mt-2">{pct}% gegenüber deutschen Marktpreisen</p>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-1 text-xs">
                {PRODUCTS.map(p => qtys[p.key] > 0 && (
                  <div key={p.key} className="flex justify-between">
                    <span className="opacity-70">{qtys[p.key]}× {p.label}</span>
                    <span className="text-sun font-bold">−{((p.old - p.new) * qtys[p.key]).toFixed(0)}€</span>
                  </div>
                ))}
                <div className="flex justify-between font-black pt-2 border-t border-white/20 text-sun">
                  <span>TOTAL gespart</span>
                  <span>{savings.toFixed(0)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
