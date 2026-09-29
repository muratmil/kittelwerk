import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RechtText, { Massgeblich } from '@/components/recht/RechtText';
import { woerterbuch } from '@/lib/i18n';
import { alternates, pfad } from '@/lib/i18n/config';

// Metin sözlükte: lib/i18n/<dil>/recht.js → recht.datenschutz.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: woerterbuch(lang).recht.datenschutz.metaTitle,
    alternates: alternates(lang, '/datenschutz'),
    robots: { index: false, follow: false },
  };
}

export default async function Seite({ params }) {
  const { lang } = await params;
  const R = woerterbuch(lang).recht;
  const S = R.datenschutz;
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href={pfad(lang, '/')} className="inline-flex items-center gap-2 font-bold text-sm mb-10 hover:text-tomato transition-colors">{R.startseite}</a>
        <h1 className="font-serif font-black text-5xl italic tracking-tighter mb-4 hyphens-auto break-words">{S.titel}</h1>
        <hr className="border-2 border-ink mb-8" />
        <Massgeblich text={R.massgeblich} />
        {S.abschnitte.map((a) => (
          <div key={a.h}>
            <h2 className="font-serif font-black text-xl mt-8 mb-3">{a.h}</h2>
            {a.p.map((t, i) => (
              <p key={i} className="text-sm text-ink/70 leading-relaxed"><RechtText text={t} lang={lang} /></p>
            ))}
          </div>
        ))}
        <hr className="border-2 border-ink mt-8 mb-4" />
        <p className="text-xs text-ink/50">{R.entwurf}</p>
      </div>
      <Footer />
    </main>
  );
}
