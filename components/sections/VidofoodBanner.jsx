export default function VidofoodBanner() {
  return (
    <section className="bg-paper border-t-4 border-b-4 border-ink py-16">
      <div className="container mx-auto px-6">
        <div className="border-4 border-ink shadow-brutalist-lg overflow-hidden">

          {/* Header */}
          <div className="bg-[#5B21F5] text-white px-8 py-5 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Partner-Empfehlung</span>
          </div>

          <div className="bg-white grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left */}
            <div className="p-8 md:p-10 border-b-4 md:border-b-0 md:border-r-4 border-ink flex flex-col justify-between gap-6">
              <div>
                <h2 className="font-serif font-black text-4xl md:text-5xl italic tracking-tighter leading-none mb-4">
                  Dein digitales<br />
                  <span style={{ color: '#5B21F5' }}>Bestellsystem.</span>
                </h2>
                <p className="text-sm font-medium opacity-60 leading-relaxed max-w-sm">
                  Gäste bestellen direkt im Browser — keine App, kein Account-Zwang. Stripe-Checkout, digitale Speisekarte und automatischer Bondruck in einer Plattform.
                </p>
              </div>
              <a
                href="https://www.vidofood.de"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#5B21F5] text-white px-8 py-4 font-black uppercase text-sm border-4 border-ink shadow-brutalist hover:bg-ink transition-all active:translate-x-1 active:translate-y-1 self-start"
              >
                vidofood.de entdecken →
              </a>
            </div>

            {/* Right — features */}
            <div className="p-8 md:p-10 grid grid-cols-1 gap-4">
              {[
                {
                  icon: '⚡',
                  title: 'Blitzschnell',
                  desc: 'Gäste bestellen direkt im Browser — keine App-Installation, kein Account.',
                },
                {
                  icon: '%',
                  title: 'Nur 3 % Gebühr',
                  desc: 'Faire Fixgebühr statt teurer 15–30 % der großen Bestellplattformen.',
                },
                {
                  icon: '◉',
                  title: 'Automatisiert',
                  desc: 'Auszahlung via Stripe Connect und automatischer Küchen-Bondruck (CloudPRNT).',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4 border-2 border-ink p-4 bg-paper">
                  <div className="w-10 h-10 border-2 border-ink bg-[#5B21F5] text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm tracking-tight">{title}</p>
                    <p className="text-[11px] opacity-60 leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
