import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Referenzen from '@/components/sections/Referenzen';
import { createPublicClient } from '@/utils/supabase/public';
import { loadReferenzen } from '@/lib/referenzen';

// Fotoğraflar CCH'den geliyor (bkz. lib/referenzen.js); yükleme en geç bir
// dakikada burada.
export const revalidate = 60;

export const metadata = {
  title: 'Referenzen | Kittelwerk — Gastro-Textilien mit Logo bei unseren Kunden',
  description: 'Echte Kundenbeispiele: T-Shirts, Polos, Schürzen und Kappen mit Logo-Druck und Bestickung — so sieht Kittelwerk in Restaurants, Imbissen und Cafés aus.',
  alternates: { canonical: 'https://www.kittelwerk.de/referenzen' },
  openGraph: {
    title: 'Referenzen | Kittelwerk',
    description: 'Echte Kundenbeispiele — Gastro-Textilien mit Logo.',
    url: 'https://www.kittelwerk.de/referenzen',
  },
};

export default async function ReferenzenSeite() {
  const referenzen = await loadReferenzen(createPublicClient());

  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <section className="py-20 md:py-28 container mx-auto px-6">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">Referenzen</span>
        <h1 className="font-serif font-black text-5xl md:text-7xl mt-4 mb-6 italic tracking-tighter leading-none uppercase">
          Getragen in <span className="text-tomato">echten Küchen.</span>
        </h1>
        <p className="max-w-2xl text-lg font-medium opacity-70 mb-12 md:mb-16">
          Restaurants, Imbisse und Cafés tragen Kittelwerk — mit ihrem eigenen Logo, gedruckt oder bestickt.
          Hier einige Beispiele aus unseren Aufträgen.
        </p>

        {referenzen.length > 0
          ? <Referenzen referenzen={referenzen} />
          : <p className="border-4 border-dashed border-ink/30 p-10 text-center font-bold opacity-60">Bald finden Sie hier Bilder unserer Kunden.</p>}

        <div className="mt-16 border-4 border-ink bg-sun p-8 shadow-brutalist flex flex-col md:flex-row md:items-center gap-6">
          <p className="font-serif font-black text-2xl md:text-3xl italic uppercase leading-tight flex-1">
            Ihr Logo als Nächstes?
          </p>
          <a href="/produkte"
            className="inline-block bg-ink text-white px-8 py-4 font-black uppercase tracking-widest text-xs text-center hover:bg-tomato transition-colors">
            Zur Kollektion →
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
