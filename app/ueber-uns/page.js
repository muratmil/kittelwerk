import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutUs() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <section className="py-32 container mx-auto px-6 max-w-4xl">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">Unsere Geschichte</span>
        <h1 className="font-serif font-black text-6xl md:text-8xl mt-6 mb-12 italic tracking-tighter leading-none">
          Vom Werk direkt zum Herd.
        </h1>
        <div className="space-y-10 text-xl font-medium leading-tight border-l-8 border-ink pl-10">
          <p>
            Kittelwerk wurde mit einer Vision gegründet: <span className="bg-sun px-2">Echte Qualität braucht keine Zwischenhändler.</span>
          </p>
          <p className="opacity-80">
            Unsere Textilien kommen direkt vom Hersteller — ohne Zwischenstufen, ohne versteckte Kosten. Das spart Kosten, verkürzt Lieferwege und sichert faire Preise.
          </p>
          <p className="font-serif italic text-3xl leading-tight">
            "Unser Neukundenangebot ist der Startschuss für eine neue Art der Arbeitskleidung: Brutal ehrlich, extrem robust und unschlagbar im Preis."
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
