export default function FinalCTA() {
  return (
    <section className="py-24 bg-tomato text-white text-center relative overflow-hidden border-t-4 border-ink">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(45deg,transparent 0,transparent 26px,rgba(0,0,0,.04) 26px,rgba(0,0,0,.04) 52px)' }} />
      <div className="container mx-auto px-6 relative">
        <h2 className="font-serif font-black text-5xl md:text-7xl italic tracking-tighter leading-none mb-4">
          Jetzt Team<br /><span className="text-sun">einheitlich einkleiden.</span>
        </h2>
        <p className="text-base mb-8 opacity-90">Solange der Vorrat reicht. Nach der Lagerräumung kehren die Preise zurück.</p>
        <a href="#produkte"
          className="inline-block bg-paper text-ink px-10 py-4 font-black uppercase shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
          Zur Produktauswahl ›
        </a>
      </div>
    </section>
  );
}
