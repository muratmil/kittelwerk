'use client';
import { useSprache } from '@/components/i18n/SpracheProvider';

const REVIEWS = [
  { initials: 'D', name: 'Diyar', place: 'Sole Mio · Hannover', color: 'bg-tomato' },
  { initials: 'AA', name: 'Adem Altun', place: 'Dönermeister · Hameln', color: 'bg-olive' },
  { initials: 'AD', name: 'Alladdin D.', place: 'Deli Alladdin · Löhne', color: 'bg-sun' },
];

export default function Testimonials() {
  const { t } = useSprache();
  const st = t.stimmen;
  return (
    <section className="py-24 border-t-4 border-b-4 border-ink" style={{ background: '#f0eee5' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{st.kicker}</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            {st.titel1}<span className="text-tomato">{st.titelRot}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div key={r.name} className="bg-paper border-4 border-ink p-6 shadow-brutalist flex flex-col hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutalist-lg transition-all">
              <div className="text-sun text-lg tracking-wider mb-3">★★★★★</div>
              <p className="font-serif italic text-base leading-snug flex-1 mb-6">{st.zitate[i]}</p>
              <div className="flex items-center gap-3 pt-4 border-t-2 border-ink">
                <div className={`w-10 h-10 rounded-full ${r.color} ${r.color === 'bg-sun' ? 'text-ink' : 'text-white'} flex items-center justify-center font-serif font-black text-sm border-2 border-ink flex-shrink-0`}>
                  {r.initials}
                </div>
                <div>
                  <p className="font-black text-sm">{r.name}</p>
                  <p className="text-[10px] opacity-60">{r.place}</p>
                  <p className="text-[10px] text-olive font-bold mt-0.5">{st.verifiziert}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
