'use client';
import { useSprache } from '@/components/i18n/SpracheProvider';
export default function Process() {
  const { t } = useSprache();
  const pr = t.prozess;
  return (
    <section className="py-24 bg-paper border-t-4 border-b-4 border-ink" style={{ background: '#f0eee5' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{pr.kicker}</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            {pr.titel1}<span className="text-tomato">{pr.titelRot}</span>
          </h2>
        </div>
      </div>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t-4 border-l-4 border-ink">
          {pr.schritte.map((step, i) => (
            <div key={i} className="p-7 border-r-4 border-b-4 border-ink flex flex-col">
              <div className="font-serif font-black text-6xl text-tomato leading-none mb-4">{String(i + 1).padStart(2, '0')}</div>
              <h4 className="font-serif font-black text-xl mb-3">{step.title}</h4>
              <p className="text-sm text-ink/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
