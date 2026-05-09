const BENEFITS = [
  { icon: '€', title: 'Direkt vom Hersteller', desc: 'Bis zu 53% unter deutschem Marktwert. Keine Händlermargen.' },
  { icon: '✓', title: 'Deutsche Abwicklung', desc: 'SEPA-Überweisung auf deutsches Konto. Kein Auslandsaufschlag.' },
  { icon: '★', title: 'Profi-Qualität', desc: '24/1 Supreme Baumwolle. Doppelsteppung. DTF-Premium-Druck.' },
  { icon: '⚡', title: 'Schnelle Lieferung', desc: '1–2 Wochen von Bestätigung bis Lieferung deutschlandweit.' },
  { icon: '♻', title: 'Neukundenangebot', desc: 'Exklusive Aktionspreise für Neukunden — zeitlich begrenzt, aber kein Lagerabbau. Das Angebot bleibt bestehen.' },
  { icon: '◉', title: 'Vorderdruck kostenlos', desc: 'Vorderdruck ohne Aufpreis inklusive. Rückendruck nur +5 €. Vektordatei senden — wir übernehmen alles.' },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-ink text-white border-t-4 border-sun">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sun/70">— Ihre Vorteile —</span>
          <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
            Kein Zwischenhandel.<br /><span className="text-tomato">Keine Gebühren.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="p-6 border-2 border-white/30 hover:border-sun hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#F5B800] transition-all">
              <div className="w-10 h-10 bg-sun text-ink flex items-center justify-center font-serif font-black text-lg mb-4">
                {b.icon}
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
