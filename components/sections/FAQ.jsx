'use client';
import { useState } from 'react';
import { useSprache } from '@/components/i18n/SpracheProvider';

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const { t } = useSprache();
  const fq = t.faq;
  return (
    <section className="py-24 bg-paper border-t-4 border-ink" id="faq">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{fq.kicker}</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            {fq.titel1}<span className="text-tomato">{fq.titelRot}</span>{fq.titel2}
          </h2>
        </div>
        <div className="border-t-2 border-ink">
          {fq.liste.map((item, i) => (
            <div key={i} className="border-b-2 border-ink">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center gap-4 py-5 text-left font-serif font-black text-lg hover:text-tomato transition-colors"
              >
                {item.q}
                <span className="text-tomato text-2xl font-light flex-shrink-0">{open === i ? '×' : '+'}</span>
              </button>
              {open === i && (
                <p className="pb-5 text-sm text-ink/70 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
