export default function VidofoodBanner() {
  return (
    <section className="bg-paper border-t-4 border-ink">
      <div className="container mx-auto px-6 py-6">
        <a
          href="https://www.vidofood.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-6 border-2 border-ink bg-white px-8 py-5 shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <img src="/vidofood_logo.webp" alt="VidoFood" className="h-20 w-auto flex-shrink-0" />
          <div className="text-center sm:text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-40">Partner-Empfehlung</span>
            <p className="font-black text-base uppercase tracking-tight leading-none">Digitales Bestellsystem für Gastronomen</p>
            <p className="text-[12px] opacity-50 mt-1">Stripe-Checkout · 3% Gebühr · Bondruck · Keine App</p>
          </div>
          <span className="text-[11px] font-black uppercase border-2 border-ink px-5 py-3 bg-[#5B21F5] text-white flex-shrink-0 sm:ml-auto">
            Jetzt ansehen →
          </span>
        </a>
      </div>
    </section>
  );
}
