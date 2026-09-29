import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RechtText, { Massgeblich } from '@/components/recht/RechtText';
import { woerterbuch } from '@/lib/i18n';
import { alternates, pfad } from '@/lib/i18n/config';

// Metin sözlükte: lib/i18n/<dil>/recht.js → recht.impressum.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: woerterbuch(lang).recht.impressum.metaTitle, alternates: alternates(lang, '/impressum') };
}

export default async function Impressum({ params }) {
  const { lang } = await params;
  const R = woerterbuch(lang).recht;
  const I = R.impressum;
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <section className="py-32 container mx-auto px-6 max-w-3xl">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">{R.rechtliches}</span>
        <h1 className="font-serif font-black text-6xl md:text-8xl mt-6 mb-16 italic tracking-tighter leading-none">
          {I.titel}
        </h1>
        <Massgeblich text={R.massgeblich} />

        <div className="space-y-10 text-base leading-relaxed">
          {I.abschnitte.map((a) => (
            <div key={a.h}>
              <h2 className="font-serif font-black text-xl mb-3">{a.h}</h2>
              {a.adresse && (
                <p className="text-ink/80">
                  {a.adresse.map((z, i) => <span key={i}>{z}{i < a.adresse.length - 1 && <br />}</span>)}
                </p>
              )}
              {(a.p ?? []).map((t, i) => (
                <p key={i} className={`text-ink/80${i ? ' mt-3' : ''}`}><RechtText text={t} lang={lang} agbLink={I.agbLink} /></p>
              ))}
              {a.klein && <p className="text-ink/60 text-sm mt-2">{a.klein}</p>}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
