export default function VidofoodBanner() {
  return (
    <section className="bg-paper border-t-4 border-ink">
      <div className="container mx-auto px-6 py-6">
        <a
          href="https://www.vidofood.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-ink bg-white px-6 py-4 shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="bg-[#5B21F5] border-2 border-ink px-3 py-1.5 flex-shrink-0">
              <span className="font-black text-white text-3xl tracking-tight leading-none">vido<span className="opacity-70">food</span></span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-40">Partner-Empfehlung</span>
              <p className="font-black text-sm uppercase tracking-tight leading-none">Digitales Bestellsystem für Gastronomen</p>
              <p className="text-[11px] opacity-50 mt-0.5">Stripe-Checkout · 3% Gebühr · Bondruck · Keine App</p>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase border-2 border-ink px-4 py-2 bg-[#5B21F5] text-white flex-shrink-0">
            Jetzt ansehen →
          </span>
        </a>
      </div>
    </section>
  );
}
