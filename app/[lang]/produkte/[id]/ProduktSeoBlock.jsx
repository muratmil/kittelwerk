import Link from 'next/link';
import { KATEGORIEN } from '@/data/kategorien';

/**
 * Ratgeber-Abschnitt unter dem Produkt (2026-10-12, SEO/GEO): Fließtext mit den Begriffen,
 * nach denen gesucht wird, plus kurze FAQ. Nur wo `data/produkt-seo.js` einen Text hat.
 */
export default function ProduktSeoBlock({ seo, category, p }) {
  if (!seo) return null;
  const kat = KATEGORIEN.find((k) => k.key === category);
  return (
    <section className="border-t-2 border-ink bg-white">
      <div className="container mx-auto px-6 py-14 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-serif font-black text-2xl md:text-3xl uppercase italic tracking-tighter leading-tight mb-5">{seo.h2}</h2>
          <div className="space-y-4 text-[15px] leading-relaxed opacity-80">
            {seo.absaetze.map((a) => <p key={a}>{a}</p>)}
          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-[11px] font-black uppercase tracking-widest">
            {kat && <Link href={p(`/produkte/${kat.slug}`)} className="underline decoration-2 underline-offset-4 hover:text-tomato">Alle Produkte dieser Kategorie →</Link>}
            <Link href={p('/druckinfo')} className="underline decoration-2 underline-offset-4 hover:text-tomato">Druck & Stickerei →</Link>
            <Link href={p('/referenzen')} className="underline decoration-2 underline-offset-4 hover:text-tomato">Referenzen →</Link>
          </div>
        </div>
        {seo.faq.length > 0 && (
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-3">Häufige Fragen</h3>
            <div className="border-2 border-ink divide-y-2 divide-ink/10">
              {seo.faq.map((f) => (
                <details key={f.q} className="group p-4">
                  <summary className="cursor-pointer font-bold text-[14px] list-none flex justify-between gap-3">
                    {f.q}<span className="group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-relaxed opacity-80">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
