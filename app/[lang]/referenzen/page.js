import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Referenzen from '@/components/sections/Referenzen';
import { createPublicClient } from '@/utils/supabase/public';
import { loadReferenzen } from '@/lib/referenzen';
import { woerterbuch } from '@/lib/i18n';
import { alternates, pfad } from '@/lib/i18n/config';

// Fotoğraflar CCH'den geliyor (bkz. lib/referenzen.js); yükleme en geç bir
// dakikada burada.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const s = woerterbuch(lang).referenzen.seite;
  const alt = alternates(lang, '/referenzen');
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: alt,
    openGraph: { title: s.ogTitle, description: s.ogDescription, url: alt.canonical },
  };
}

export default async function ReferenzenSeite({ params }) {
  const { lang } = await params;
  const r = woerterbuch(lang).referenzen;
  const referenzen = await loadReferenzen(createPublicClient(), { lang });

  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <section className="py-20 md:py-28 container mx-auto px-6">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">{r.seite.kicker}</span>
        <h1 className="font-serif font-black text-5xl md:text-7xl mt-4 mb-6 italic tracking-tighter leading-none uppercase">
          {r.titel1}<span className="text-tomato">{r.titelRot}</span>
        </h1>
        <p className="max-w-2xl text-lg font-medium opacity-70 mb-12 md:mb-16">
          {r.seite.text}
        </p>

        {referenzen.length > 0
          ? <Referenzen referenzen={referenzen} />
          : <p className="border-4 border-dashed border-ink/30 p-10 text-center font-bold opacity-60">{r.seite.leer}</p>}

        <div className="mt-16 border-4 border-ink bg-sun p-8 shadow-brutalist flex flex-col md:flex-row md:items-center gap-6">
          <p className="font-serif font-black text-2xl md:text-3xl italic uppercase leading-tight flex-1">
            {r.seite.naechstes}
          </p>
          <a href={pfad(lang, '/produkte')}
            className="inline-block bg-ink text-white px-8 py-4 font-black uppercase tracking-widest text-xs text-center hover:bg-tomato transition-colors">
            {r.seite.kollektion}
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
