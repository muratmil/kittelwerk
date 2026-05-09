const STEPS = [
  { num: '01', title: 'Produkte wählen', desc: 'Min. 10 Stück gesamt. Farben: Schwarz / Weiß / Rot. Produkte kombinierbar.' },
  { num: '02', title: 'Daten & Logo senden', desc: 'Bestellung über den Warenkorb. Logo als Vektor (Ai/EPS/PDF) an info@kittelwerk.de.' },
  { num: '03', title: 'Angebot erhalten', desc: 'Verbindliches Angebot mit Stückpreisen innerhalb 24 Stunden per E-Mail.' },
  { num: '04', title: 'Lieferung', desc: 'Zahlung an deutsches Konto. Versand in 1–2 Wochen deutschlandweit.' },
];

export default function Process() {
  return (
    <section className="py-24 bg-paper border-t-4 border-b-4 border-ink" style={{ background: '#f0eee5' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— So einfach geht's —</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            In 4 Schritten zum <span className="text-tomato">Team-Outfit.</span>
          </h2>
        </div>
      </div>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t-4 border-l-4 border-ink">
          {STEPS.map((step) => (
            <div key={step.num} className="p-7 border-r-4 border-b-4 border-ink flex flex-col">
              <div className="font-serif font-black text-6xl text-tomato leading-none mb-4">{step.num}</div>
              <h4 className="font-serif font-black text-xl mb-3">{step.title}</h4>
              <p className="text-sm text-ink/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
