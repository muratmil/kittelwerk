import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { LogoServiceButton, FileCheckButton } from '@/components/cart/ServiceCartButtons';
import { woerterbuch } from '@/lib/i18n';
import { alternates, pfad } from '@/lib/i18n/config';

// Baskı teknikleri sayfası. Metinler 2026-09-29'dan beri sözlükte
// (`lib/i18n/<dil>/druckinfo.js`); görünüm tek, her dilde aynı.
// Renkler ve görseller metinden ayrı — burada, sıraya göre.

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = woerterbuch(lang).druckinfo.meta;
  const alt = alternates(lang, '/druckinfo');
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: alt,
    openGraph: { title: m.title, description: m.ogDescription, url: alt.canonical },
  };
}

const TECHNIK_BADGE = ['bg-olive text-white', 'bg-sun text-ink', 'bg-tomato text-white'];
const ZEILEN_FARBE = { olive: 'text-olive', tomato: 'text-tomato' };
const POSITION_BILD = ['/images/pos-tshirt-front.webp', '/images/pos-tshirt-back.webp', '/images/pos-apron.webp', '/images/pos-cap.webp'];
const ABLAUF_FARBE = ['bg-sun', 'bg-tomato text-white', 'bg-olive text-white', 'bg-ink text-white'];
const FORMAT_FARBE = ['bg-olive text-white', 'bg-sun text-ink', 'bg-sun text-ink'];
const PFLEGE_FARBE = ['bg-ink text-white', 'bg-olive text-white', 'bg-tomato text-white'];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-olive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg className="w-4 h-4 text-tomato flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function Kopf({ kicker, titel1, titelRot, klein = false, children }) {
  return (
    <div className={`text-center ${klein ? 'mb-12' : 'mb-14'}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{kicker}</span>
      <h2 className={`font-serif font-black ${klein ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'} uppercase italic tracking-tighter mt-2 leading-none`}>
        {titel1}<span className="text-tomato">{titelRot}</span>
      </h2>
      {children}
    </div>
  );
}

export default async function DruckInfo({ params }) {
  const { lang } = await params;
  const d = woerterbuch(lang).druckinfo;

  const druckSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: d.schemaFaq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };

  return (
    <main className="bg-paper min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(druckSchema) }} />
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="border-b-4 border-ink py-20 md:py-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">{d.hero.kicker}</span>
          <h1 className="font-serif font-black text-5xl md:text-8xl mt-4 mb-6 italic tracking-tighter leading-none">
            {d.hero.titel[0]}<br />{d.hero.titel[1]}<br /><span className="text-tomato">{d.hero.titelRot}</span>
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-70 max-w-2xl leading-relaxed">
            {d.hero.text}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-sun border-2 border-ink px-5 py-3 shadow-brutalist font-black text-sm uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {d.hero.badge}
          </div>
        </div>
      </section>

      {/* ─── 3 Techniken ─── */}
      <section className="py-20 border-b-4 border-ink" id="techniken">
        <div className="container mx-auto px-6 max-w-6xl">
          <Kopf {...d.techniken} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {d.techniken.karten.map((k, i) => (
              <div key={k.name} className="border-4 border-ink shadow-brutalist-lg bg-white flex flex-col">
                <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                  <span className="font-serif font-black text-xl italic">{k.name}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${TECHNIK_BADGE[i]}`}>{k.badge}</span>
                </div>
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <p className="text-[11px] uppercase tracking-widest font-black opacity-50">{k.unter}</p>
                  <p className="text-sm leading-relaxed">{k.text}</p>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 pt-2">{d.techniken.vorteile}</p>
                    {k.vorteile.map((t) => (
                      <div key={t} className="flex items-start gap-2 text-sm"><CheckIcon /><span>{t}</span></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50">{d.techniken.hinweise}</p>
                    {k.hinweise.map((t) => (
                      <div key={t} className="flex items-start gap-2 text-sm"><WarnIcon /><span>{t}</span></div>
                    ))}
                  </div>
                  <div className="mt-auto pt-4 border-t-2 border-ink">
                    {k.zeilen.map(([label, wert, farbe], j) => (
                      <div key={label} className={`flex justify-between text-[10px] font-black uppercase ${j ? 'mt-1' : ''}`}>
                        <span className="opacity-50">{label}</span>
                        <span className={ZEILEN_FARBE[farbe] ?? ''}>{wert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Druckpositionen ─── */}
      <section className="py-20 border-b-4 border-ink bg-white" id="positionen">
        <div className="container mx-auto px-6 max-w-6xl">
          <Kopf {...d.positionen}>
            <p className="mt-4 text-sm opacity-60 max-w-xl mx-auto">{d.positionen.text}</p>
          </Kopf>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {d.positionen.karten.map((k, i) => (
              <div key={k.titel} className="border-4 border-ink p-6 flex flex-col items-center gap-4">
                <img src={POSITION_BILD[i]} alt={k.alt} className="w-full max-w-[200px] mx-auto object-contain" />
                <div className="w-full space-y-2 border-t-2 border-ink pt-4">
                  <p className="font-black text-sm uppercase tracking-widest">{k.titel}</p>
                  <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">{d.positionen.mass}</span><span>{k.mass}</span></div>
                  <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">{d.positionen.position}</span><span>{k.position}</span></div>
                  <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">{d.positionen.technik}</span><span>{k.technik}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 border-2 border-ink bg-sun/30 p-5 text-sm leading-relaxed">
            <p><strong>{d.positionen.abweichendStark}</strong>{d.positionen.abweichend}</p>
          </div>
        </div>
      </section>

      {/* ─── Ablauf / Prozess ─── */}
      <section className="py-20 border-b-4 border-ink" id="ablauf">
        <div className="container mx-auto px-6 max-w-5xl">
          <Kopf {...d.ablauf} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {d.ablauf.schritte.map((step, i) => (
              <div key={step.title} className="border-4 border-ink flex flex-col">
                <div className={`${ABLAUF_FARBE[i]} px-5 py-4 border-b-4 border-ink`}>
                  <span className="font-serif font-black text-4xl italic tracking-tighter">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <p className="font-black text-sm uppercase tracking-widest">{step.title}</p>
                  <p className="text-sm leading-relaxed opacity-70">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Logo & Vorlage ─── */}
      <section className="py-20 border-b-4 border-ink bg-white" id="logo">
        <div className="container mx-auto px-6 max-w-5xl">
          <Kopf {...d.logo} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-4 border-ink p-8 space-y-5">
              <p className="font-black text-sm uppercase tracking-widest">{d.logo.formate}</p>
              <div className="space-y-3">
                {d.logo.liste.map((f, i) => (
                  <div key={f.fmt} className="flex items-start gap-4 border-2 border-ink p-3">
                    <div className="font-black text-xs uppercase bg-paper border border-ink px-2 py-1 flex-shrink-0">{f.fmt}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{f.label}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 ${FORMAT_FARBE[i]}`}>{f.badge}</span>
                      </div>
                      <p className="text-[11px] opacity-60 mt-0.5">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-4 border-ink p-8 space-y-4">
                <p className="font-black text-sm uppercase tracking-widest">{d.logo.stickTitel}</p>
                <ul className="space-y-3 text-sm">
                  {d.logo.stick.map((t) => (
                    <li key={t} className="flex items-start gap-2"><WarnIcon /><span>{t}</span></li>
                  ))}
                </ul>
              </div>

              <div className="border-4 border-sun bg-sun/20 p-6 shadow-brutalist space-y-3">
                <p className="font-black text-sm uppercase tracking-widest">{d.logo.vektorTitel}</p>
                <p className="text-sm leading-relaxed">
                  {d.logo.vektor1}<strong>{d.logo.vektorStark}</strong>{d.logo.vektor2}
                </p>
                <p className="text-[11px] opacity-60">{d.logo.vektorKlein}</p>
                <LogoServiceButton />
              </div>

              <div className="border-4 border-olive/30 bg-olive/5 p-6 shadow-brutalist space-y-3">
                <p className="font-black text-sm uppercase tracking-widest">{d.logo.dateiTitel}</p>
                <p className="text-sm leading-relaxed">
                  {d.logo.datei1}<strong>{d.logo.dateiStark}</strong>{d.logo.datei2}
                </p>
                <p className="text-[11px] opacity-60">{d.logo.dateiKlein}</p>
                <FileCheckButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pflege ─── */}
      <section className="py-20 border-b-4 border-ink" id="pflege">
        <div className="container mx-auto px-6 max-w-5xl">
          <Kopf {...d.pflege} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {d.pflege.karten.map((c, i) => (
              <div key={c.title} className="border-4 border-ink">
                <div className={`${PFLEGE_FARBE[i]} px-6 py-4 border-b-4 border-ink`}>
                  <span className="font-black text-sm uppercase tracking-widest">{c.title}</span>
                </div>
                <ul className="p-6 space-y-3">
                  {c.tips.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm"><CheckIcon /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 border-4 border-ink bg-sun/30 p-6">
            <p className="font-black text-sm uppercase tracking-widest mb-3">{d.pflege.sweatTitel}</p>
            <p className="text-sm leading-relaxed">
              {d.pflege.sweat1}<strong>{d.pflege.sweatStark}</strong>{d.pflege.sweat2}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Übersichtstabelle ─── */}
      <section className="py-20 border-b-4 border-ink bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <Kopf {...d.tabelle} klein />
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-ink text-sm">
              <thead>
                <tr className="bg-ink text-white">
                  {d.tabelle.kopf.map((k, i) => (
                    <th key={k} className={`${i === 0 ? 'text-left ' : ''}px-4 py-3 text-[10px] font-black uppercase tracking-widest${i < 3 ? ' border-r border-white/20' : ''}`}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.tabelle.zeilen.map(([prop, dtf, sieb, best], i) => (
                  <tr key={prop} className={i % 2 === 0 ? 'bg-paper' : 'bg-white'}>
                    <td className="px-4 py-3 font-black text-[11px] uppercase border-r-2 border-ink">{prop}</td>
                    <td className="px-4 py-3 text-center text-[11px] border-r border-ink/20">{dtf}</td>
                    <td className="px-4 py-3 text-center text-[11px] border-r border-ink/20">{sieb}</td>
                    <td className="px-4 py-3 text-center text-[11px]">{best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 border-b-4 border-ink" id="faq">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{d.faq.kicker}</span>
            <h2 className="font-serif font-black text-4xl md:text-5xl uppercase italic tracking-tighter mt-2 leading-none">
              {d.faq.titel1}<span className="text-tomato">{d.faq.titelRot}</span>
            </h2>
          </div>
          <div className="border-t-2 border-ink">
            {d.faq.liste.map((item, i) => (
              <details key={i} className="border-b-2 border-ink group">
                <summary className="w-full flex justify-between items-center gap-4 py-5 cursor-pointer font-serif font-black text-lg hover:text-tomato transition-colors list-none">
                  {item.q}
                  <span className="text-tomato text-2xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="pb-5 text-sm text-ink/70 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border-4 border-ink bg-ink text-white p-10 shadow-brutalist-lg text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{d.cta.kicker}</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl italic tracking-tighter mt-4 mb-6 leading-none">
              {d.cta.titel1}<br /><span className="text-sun">{d.cta.titel2}</span>
            </h2>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">{d.cta.text}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={pfad(lang, '/produkte')}
                className="bg-tomato text-white font-black uppercase px-8 py-4 hover:bg-sun hover:text-ink transition-all shadow-[4px_4px_0px_0px_#FAFBF7] hover:shadow-none hover:translate-x-1 hover:translate-y-1 tracking-widest text-sm">
                {d.cta.bestellen}
              </Link>
              <a href="mailto:info@kittelwerk.de"
                className="border-2 border-white text-white font-black uppercase px-8 py-4 hover:bg-white hover:text-ink transition-all tracking-widest text-sm">
                {d.cta.frage}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
