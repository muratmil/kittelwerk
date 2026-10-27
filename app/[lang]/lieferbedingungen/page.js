import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Massgeblich } from '@/components/recht/RechtText';
import { woerterbuch } from '@/lib/i18n';
import { alternates, pfad, indexlenir } from '@/lib/i18n/config';

// Metin sözlükte: lib/i18n/<dil>/recht.js → recht.liefer.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const L = woerterbuch(lang).recht.liefer;
  return {
    title: L.metaTitle,
    description: L.metaDescription,
    alternates: alternates(lang, '/lieferbedingungen'),
    robots: { index: indexlenir(lang), follow: true },
  };
}

const ZEIT_FARBE = ['bg-olive text-white', 'bg-sun text-ink', 'bg-sun text-ink'];

export default async function Lieferbedingungen({ params }) {
  const { lang } = await params;
  const R = woerterbuch(lang).recht;
  const L = R.liefer;
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />

      <section className="py-24 container mx-auto px-6 max-w-3xl">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">{L.kicker}</span>
        <h1 className="font-serif font-black text-5xl md:text-7xl mt-4 mb-16 italic tracking-tighter leading-none">
          {L.titel}
        </h1>
        <Massgeblich text={R.massgeblich} />

        <div className="space-y-12">

          {/* Lieferzeiten */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">{L.lieferzeiten}</h2>
            <div className="space-y-3 text-sm font-medium leading-relaxed">
              {L.gruppen.map((g, i) => (
                <div key={g.titel} className="flex items-start gap-4 border-2 border-ink p-4">
                  <span className={`${ZEIT_FARBE[i]} font-black text-[9px] uppercase px-2 py-1 whitespace-nowrap mt-0.5`}>{g.zeit}</span>
                  <div>
                    <p className="font-black uppercase tracking-wide text-[11px] mb-1">{g.titel}</p>
                    <p className="opacity-60">{g.produkte}</p>
                  </div>
                </div>
              ))}
              <p className="text-[11px] opacity-50 mt-3">{L.zeitHinweis}</p>
            </div>
          </div>

          {/* Versandkosten */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">{L.versandkosten}</h2>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 border-2 border-ink">
                <div className="p-3 border-r-2 border-ink font-black text-[11px] uppercase tracking-wide bg-ink/5">{L.bestellwert}</div>
                <div className="p-3 font-black text-[11px] uppercase tracking-wide bg-ink/5">{L.versandkosten}</div>
              </div>
              <div className="grid grid-cols-2 border-2 border-t-0 border-ink">
                <div className="p-3 border-r-2 border-ink opacity-70">0 € – 99,99 €</div>
                <div className="p-3 font-black">9,90 €</div>
              </div>
              <div className="grid grid-cols-2 border-2 border-t-0 border-ink">
                <div className="p-3 border-r-2 border-ink opacity-70">100 € – 299,99 €</div>
                <div className="p-3 font-black">14,90 €</div>
              </div>
              <div className="grid grid-cols-2 border-2 border-t-0 border-ink bg-sun">
                <div className="p-3 border-r-2 border-ink font-black">{L.ab300}</div>
                <div className="p-3 font-black text-tomato">{L.kostenlos}</div>
              </div>
            </div>
            <p className="text-[11px] opacity-50 mt-3">{L.ausland}</p>
          </div>

          {/* Zahlung */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">{L.zahlung}</h2>
            <div className="space-y-3 text-sm font-medium leading-relaxed opacity-80">
              <p>{L.zahlung1a}<strong>{L.zahlung1Stark}</strong>{L.zahlung1b}</p>
              <p>{L.zahlung2}</p>
              <p>{L.zahlung3}</p>
            </div>
          </div>

          {/* Bestellprozess */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">{L.prozess}</h2>
            <ol className="space-y-3 text-sm font-medium">
              {L.schritte.map(([title, desc], i) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="bg-ink text-sun font-black text-sm w-8 h-8 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div>
                    <p className="font-black uppercase tracking-wide text-[11px]">{title}</p>
                    <p className="opacity-60 text-[11px] mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Kontakt */}
          <div className="bg-ink text-white p-6 border-4 border-ink shadow-brutalist">
            <p className="font-black uppercase tracking-widest text-[10px] text-white/40 mb-2">{L.fragen}</p>
            <p className="font-serif font-black text-2xl italic tracking-tight leading-none mb-3">{L.helfen}</p>
            <a href={pfad(lang, '/kontakt')} className="inline-block bg-tomato text-white font-black uppercase text-[11px] px-6 py-3 hover:bg-white hover:text-ink transition-all">
              {L.kontakt}
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
