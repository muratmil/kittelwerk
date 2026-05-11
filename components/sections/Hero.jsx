export default function Hero() {
  return (
    <section className="bg-ink text-white py-24 border-b-4 border-tomato overflow-hidden">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 items-center">
        <div className="min-w-0">
          <span className="text-sun font-black uppercase tracking-[0.3em] text-[10px]">
            Neukundenangebot
          </span>
          <h1 className="font-serif font-black text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl leading-none mt-4 tracking-tighter italic">
            Stark Reduziert!
          </h1>
          <p className="font-serif font-black text-2xl md:text-3xl italic text-tomato tracking-tighter mt-1 leading-none">
            Alles sehr günstig.
          </p>
          <p className="mt-6 text-paper/70 text-lg max-w-md font-medium leading-tight">
            Hochwertige Gastro-Textilien zu unschlagbaren Preisen. <span className="text-sun font-bold">Alle Druckoptionen kostenlos inklusive.</span>
          </p>
          <div className="mt-10">
            <a href="#produkte" className="bg-tomato text-white px-8 py-4 font-black uppercase shadow-[4px_4px_0px_0px_#FAFBF7] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all inline-block">
              Jetzt Entdecken
            </a>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="border-4 border-sun p-2 rotate-3 shadow-brutalist bg-paper relative z-10">
            <img src="/images/belden.png" alt="Kittelwerk Team" className="w-full grayscale contrast-125" />
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-tomato rounded-full -z-0 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
