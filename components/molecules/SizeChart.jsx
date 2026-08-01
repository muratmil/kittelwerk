'use client';
import { useState } from 'react';
import { Ruler, ChevronDown } from 'lucide-react';

// Maßtabelle — nur für Produkte mit `sizeChart` in data/products.js.
// Spalten kommen aus `product.sizes`, Zeilen aus `sizeChart.rows`.
export default function SizeChart({ sizes, chart }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!chart?.rows?.length || !sizes?.length) return null;

  const fmt = (v) => (v === null || v === undefined ? '–' : String(v).replace('.', ','));

  return (
    <div className="border-4 border-ink bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-sun transition-all"
      >
        <Ruler size={16} className="flex-shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-widest">Maßtabelle</span>
        <span className="text-[9px] uppercase tracking-widest opacity-50 ml-auto mr-2 hidden sm:inline">
          {sizes[0]}–{sizes[sizes.length - 1]}
        </span>
        <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t-2 border-ink px-5 py-4">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full border-collapse text-[11px] min-w-[380px]">
              <thead>
                <tr>
                  <th className="text-left font-black uppercase text-[9px] tracking-widest pb-2 pr-3 whitespace-nowrap">
                    Maß in cm
                  </th>
                  {sizes.map((size) => (
                    <th key={size} className="font-black uppercase text-[10px] pb-2 px-1 text-center w-12">
                      {size}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row.label} className="border-t-2 border-ink/10">
                    <td className="py-1.5 pr-3 opacity-70 whitespace-nowrap">{row.label}</td>
                    {row.values.map((value, i) => (
                      <td key={sizes[i] ?? i} className="py-1.5 px-1 text-center font-black tabular-nums">
                        {fmt(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chart.note && (
            <p className="text-[10px] leading-relaxed opacity-60 mt-3 pt-3 border-t-2 border-ink/10">
              {chart.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
