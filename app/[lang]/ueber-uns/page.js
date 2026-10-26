import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { woerterbuch } from '@/lib/i18n';
import { alternates } from '@/lib/i18n/config';
import Referenzen from '@/components/sections/Referenzen';
import { PRODUKTION_BILDER } from '@/data/produktion';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = woerterbuch(lang).ueberUns.meta;
  const alt = alternates(lang, '/ueber-uns');
  return {
    title: m.title,
    description: m.description,
    alternates: alt,
    openGraph: { title: m.ogTitle, description: m.ogDescription, url: alt.canonical },
  };
}

export default async function AboutUs({ params }) {
  const { lang } = await params;
  const u = woerterbuch(lang).ueberUns;
  const P = u.produktion;
  const bilder = PRODUKTION_BILDER.map((b) => ({ id: b.id, src: b.src, titel: P.bild[b.art] }));
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <section className="py-32 container mx-auto px-6 max-w-4xl">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">{u.kicker}</span>
        <h1 className="font-serif font-black text-6xl md:text-8xl mt-6 mb-12 italic tracking-tighter leading-none">
          {u.titel}
        </h1>
        <div className="space-y-10 text-xl font-medium leading-tight border-l-8 border-ink pl-10">
          <p>
            {u.vision1}<span className="bg-sun px-2">{u.visionStark}</span>
          </p>
          <p className="opacity-80">
            {u.text}
          </p>
          <p className="font-serif italic text-3xl leading-tight">
            {u.zitat}
          </p>
        </div>
      </section>
      <section className="pb-32 container mx-auto px-6">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">{P.kicker}</span>
        <h2 className="font-serif font-black text-4xl md:text-6xl mt-4 mb-4 italic tracking-tighter leading-none">{P.titel}</h2>
        <p className="text-base font-medium opacity-70 max-w-2xl mb-10">{P.text}</p>
        <Referenzen referenzen={bilder} />
      </section>
      <Footer />
    </main>
  );
}
