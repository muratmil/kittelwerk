'use client';
import { useSprache } from '@/components/i18n/SpracheProvider';
const ICONS = ['€', '✓', '★', '⚡', '♻', '◉'];

export default function Benefits() {
  const { t } = useSprache();
  const v = t.vorteile;
  return (
    <section className="py-24 bg-ink text-white border-t-4 border-sun">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sun/70">{v.kicker}</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            {v.titel1}<br /><span className="text-tomato">{v.titelRot}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {v.liste.map((b, i) => (
            <div key={i} className="p-6 border-2 border-white/30 hover:border-sun hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#F5B800] transition-all">
              <div className="w-10 h-10 bg-sun text-ink flex items-center justify-center font-serif font-black text-lg mb-4">
                {ICONS[i]}
              </div>
              <h4 className="font-serif font-black text-lg mb-2">{b.title}</h4>
              <p className="text-sm opacity-75 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
