const REVIEWS = [
  { initials: 'MK', name: 'Murat K.', place: 'Restaurant Bosporus · Hannover', color: 'bg-tomato', quote: '"Qualität wie versprochen. Stoff deutlich dicker als unser alter Lieferant — und wir zahlen die Hälfte. Logo-Druck sitzt perfekt."' },
  { initials: 'SH', name: 'Sandra H.', place: 'Café Marrone · Berlin', color: 'bg-olive', quote: '"Nach der ersten Lieferung von 30 Schürzen ist klar: passt. Bestellen demnächst die T-Shirts nach."' },
  { initials: 'EY', name: 'Erkan Y.', place: 'Pide-Haus 1453 · München', color: 'bg-sun', quote: '"Schnelle Abwicklung, Lieferung in 8 Tagen. Sweatshirt-Material top. Klare Empfehlung."' },
];

export default function Testimonials() {
  return (
    <section className="py-24 border-t-4 border-b-4 border-ink" style={{ background: '#f0eee5' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Was Gastronomen sagen —</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            Echte Stimmen aus <span className="text-tomato">echten Restaurants.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-paper border-4 border-ink p-6 shadow-brutalist flex flex-col hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutalist-lg transition-all">
              <div className="text-sun text-lg tracking-wider mb-3">★★★★★</div>
              <p className="font-serif italic text-base leading-snug flex-1 mb-6">{r.quote}</p>
              <div className="flex items-center gap-3 pt-4 border-t-2 border-ink">
                <div className={`w-10 h-10 rounded-full ${r.color} ${r.color === 'bg-sun' ? 'text-ink' : 'text-white'} flex items-center justify-center font-serif font-black text-sm border-2 border-ink flex-shrink-0`}>
                  {r.initials}
                </div>
                <div>
                  <p className="font-black text-sm">{r.name}</p>
                  <p className="text-[10px] opacity-60">{r.place}</p>
                  <p className="text-[10px] text-olive font-bold mt-0.5">✓ Verifizierter Käufer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
