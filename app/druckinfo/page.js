import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Drucktechniken & Veredelung | Kittelwerk',
  description: 'DTF-Druck, Siebdruck und Bestickung für Gastro-Textilien — transparent erklärt. Druckpositionen, Maße, Qualität, Pflege und Logo-Anforderungen. Kittelwerk — Textilien für die Gastronomie.',
  keywords: 'DTF Druck Gastronomie, Siebdruck Textilien Hannover, Bestickung Arbeitskleidung, Druckpositionen Logo Textil, Textilveredelung Hannover Niedersachsen, Logo Druck Gastro T-Shirt',
  alternates: { canonical: 'https://www.kittelwerk.de/druckinfo' },
  openGraph: {
    title: 'Drucktechniken & Veredelung | Kittelwerk',
    description: 'DTF-Druck, Siebdruck und Bestickung für Gastro-Textilien — Druckpositionen, Maße und Pflegehinweise transparent erklärt.',
    url: 'https://www.kittelwerk.de/druckinfo',
  },
};

const druckSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Was ist der Unterschied zwischen DTF-Druck und Siebdruck?',
      acceptedAnswer: { '@type': 'Answer', text: 'DTF-Druck (Direct-to-Film) ist ein digitales Transferverfahren — vollfarbig, weich, ideal ab 10 Stück. Siebdruck verwendet eine Druckschablone pro Farbe — extrem langlebig, industriewaschfest bis 60°C, optimal ab 150 Stück.' },
    },
    {
      '@type': 'Question',
      name: 'Wie groß wird das Logo gedruckt?',
      acceptedAnswer: { '@type': 'Answer', text: 'Standard: Brust vorne 10×10 cm, Rücken max. 24 cm Breite. Abweichende Maße auf Anfrage möglich — bitte im Bestellformular als Notiz angeben.' },
    },
    {
      '@type': 'Question',
      name: 'Wann sehe ich, wie mein Logo auf dem Textil aussieht?',
      acceptedAnswer: { '@type': 'Answer', text: 'Nach der Bestellung erstellen wir einen digitalen Korrekturabzug (Druckvorschau) und senden ihn zur Freigabe. Die Produktion startet erst nach Ihrer ausdrücklichen Freigabe.' },
    },
    {
      '@type': 'Question',
      name: 'Kann ich Bestickung auf T-Shirts haben?',
      acceptedAnswer: { '@type': 'Answer', text: 'Nein. Bestickung ist für Sweatshirts, Fleece-Jacken sowie Schürzen und Kappen verfügbar — nicht für T-Shirts. T-Shirts erhalten DTF-Druck oder Siebdruck.' },
    },
    {
      '@type': 'Question',
      name: 'Was tue ich, wenn ich kein Vektorlogo habe?',
      acceptedAnswer: { '@type': 'Answer', text: 'Wir empfehlen, ein Vektorlogo (Ai, EPS, PDF) zu verwenden. Falls Ihr Logo nicht vektoriell vorliegt, können Sie beim Bestellen unseren Logo-Erstellungsservice für 100€ dazubuchen — wir vermitteln einen Partner-Grafiker.' },
    },
  ],
};

function TshirtFrontSVG() {
  return (
    <svg viewBox="0 0 200 210" className="w-full max-w-[180px] mx-auto" aria-label="T-Shirt Vorderseite mit Druckbereich Brust">
      <path d="M100,16 C94,30 76,33 58,25 L18,62 L44,68 L44,195 L156,195 L156,68 L182,62 L142,25 C124,33 106,30 100,16 Z"
        fill="#FAFBF7" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <rect x="63" y="75" width="74" height="74" rx="2"
        fill="#E63946" fillOpacity="0.15" stroke="#E63946" strokeWidth="2" strokeDasharray="5,3" />
      <text x="100" y="108" textAnchor="middle" fontSize="11" fontWeight="900" fill="#E63946" fontFamily="sans-serif">10 × 10 cm</text>
      <text x="100" y="122" textAnchor="middle" fontSize="9" fill="#E63946" fillOpacity="0.8" fontFamily="sans-serif">BRUST VORNE</text>
    </svg>
  );
}

function TshirtBackSVG() {
  return (
    <svg viewBox="0 0 200 210" className="w-full max-w-[180px] mx-auto" aria-label="T-Shirt Rückseite mit Druckbereich Rücken">
      <path d="M100,16 C94,30 76,33 58,25 L18,62 L44,68 L44,195 L156,195 L156,68 L182,62 L142,25 C124,33 106,30 100,16 Z"
        fill="#e8e8e3" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <rect x="44" y="72" width="112" height="85" rx="2"
        fill="#E63946" fillOpacity="0.15" stroke="#E63946" strokeWidth="2" strokeDasharray="5,3" />
      <line x1="44" y1="72" x2="44" y2="65" stroke="#111" strokeWidth="1.5" strokeOpacity="0.5" />
      <line x1="156" y1="72" x2="156" y2="65" stroke="#111" strokeWidth="1.5" strokeOpacity="0.5" />
      <line x1="44" y1="65" x2="156" y2="65" stroke="#111" strokeWidth="1.5" strokeOpacity="0.5" />
      <text x="100" y="61" textAnchor="middle" fontSize="9" fill="#111" fillOpacity="0.5" fontFamily="sans-serif">max. 24 cm</text>
      <text x="100" y="111" textAnchor="middle" fontSize="11" fontWeight="900" fill="#E63946" fontFamily="sans-serif">max. 24 cm</text>
      <text x="100" y="125" textAnchor="middle" fontSize="9" fill="#E63946" fillOpacity="0.8" fontFamily="sans-serif">RÜCKEN</text>
    </svg>
  );
}

function ApronSVG() {
  return (
    <svg viewBox="0 0 160 230" className="w-full max-w-[140px] mx-auto" aria-label="Schürze mit Druckbereich vorne">
      <line x1="45" y1="28" x2="10" y2="42" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="115" y1="28" x2="150" y2="42" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M45,20 L115,20 L122,38 L118,210 L42,210 L38,38 Z"
        fill="#FAFBF7" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <rect x="52" y="50" width="56" height="56" rx="2"
        fill="#E63946" fillOpacity="0.15" stroke="#E63946" strokeWidth="2" strokeDasharray="5,3" />
      <text x="80" y="80" textAnchor="middle" fontSize="10" fontWeight="900" fill="#E63946" fontFamily="sans-serif">10 × 10</text>
      <text x="80" y="93" textAnchor="middle" fontSize="9" fill="#E63946" fillOpacity="0.8" fontFamily="sans-serif">VORNE</text>
    </svg>
  );
}

function CapSVG() {
  return (
    <svg viewBox="0 0 200 130" className="w-full max-w-[180px] mx-auto" aria-label="Kappe mit Druckbereich vorne">
      <path d="M38,88 C38,28 162,28 162,88 Z"
        fill="#FAFBF7" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <line x1="100" y1="30" x2="100" y2="88" stroke="#111" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.3" />
      <path d="M15,90 L185,90 L192,106 L8,106 Z"
        fill="#111" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="100" cy="62" rx="26" ry="20"
        fill="#E63946" fillOpacity="0.15" stroke="#E63946" strokeWidth="2" strokeDasharray="5,3" />
      <text x="100" y="60" textAnchor="middle" fontSize="9" fontWeight="900" fill="#E63946" fontFamily="sans-serif">ca. 7 × 5</text>
      <text x="100" y="72" textAnchor="middle" fontSize="8" fill="#E63946" fillOpacity="0.8" fontFamily="sans-serif">VORDERPANEL</text>
    </svg>
  );
}

function SweatSVG() {
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[180px] mx-auto" aria-label="Sweatshirt mit allen Druckbereichen">
      <path d="M110,18 C103,34 82,37 62,28 L16,68 L48,76 L48,200 L172,200 L172,76 L204,68 L158,28 C138,37 117,34 110,18 Z"
        fill="#FAFBF7" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <rect x="70" y="82" width="80" height="80" rx="2"
        fill="#E63946" fillOpacity="0.12" stroke="#E63946" strokeWidth="2" strokeDasharray="5,3" />
      <text x="110" y="118" textAnchor="middle" fontSize="10" fontWeight="900" fill="#E63946" fontFamily="sans-serif">10 × 10 cm</text>
      <text x="110" y="131" textAnchor="middle" fontSize="8" fill="#E63946" fillOpacity="0.8" fontFamily="sans-serif">DTF / BESTICKUNG</text>
    </svg>
  );
}

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

export default function DruckInfo() {
  return (
    <main className="bg-paper min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(druckSchema) }} />
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="border-b-4 border-ink py-20 md:py-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">Transparenz & Qualität</span>
          <h1 className="font-serif font-black text-5xl md:text-8xl mt-4 mb-6 italic tracking-tighter leading-none">
            Druck.<br />Stickerei.<br /><span className="text-tomato">Klarheit.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-70 max-w-2xl leading-relaxed">
            Was auf Ihrem Textil landet, entscheidet über Ihren ersten Eindruck im Restaurant. Deshalb erklären wir jede Technik offen — mit Vorteilen, Grenzen und ehrlichen Pflegehinweisen.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-sun border-2 border-ink px-5 py-3 shadow-brutalist font-black text-sm uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Druckvorschau vor jeder Produktion — kostenlos
          </div>
        </div>
      </section>

      {/* ─── 3 Techniken ─── */}
      <section className="py-20 border-b-4 border-ink" id="techniken">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Die drei Verfahren —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              Welche Technik <span className="text-tomato">wofür?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* DTF */}
            <div className="border-4 border-ink shadow-brutalist-lg bg-white flex flex-col">
              <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                <span className="font-serif font-black text-xl italic">DTF-Druck</span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-olive text-white px-2 py-1">Inklusive</span>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <p className="text-[11px] uppercase tracking-widest font-black opacity-50">Direct-to-Film Transfer</p>
                <p className="text-sm leading-relaxed">
                  Das Logo wird digital auf eine Spezialfolie gedruckt und per Hitzepresse auf den Stoff übertragen. Ideal für farbenfrohe, detailreiche Logos ohne Mengenbegrenzung pro Farbe.
                </p>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50 pt-2">Vorteile</p>
                  {['Vollfarbig & fotorealistisch möglich', 'Weich & dehnbar auf dem Stoff', 'Bereits ab 10 Stück verfügbar', 'Kein Aufpreis — inklusive'].map(t => (
                    <div key={t} className="flex items-start gap-2 text-sm"><CheckIcon /><span>{t}</span></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Hinweise</p>
                  {['Nach 20+ Wäschen kann Farbintensität leicht nachlassen — technische Eigenart', '30–40°C waschen, auf links drehen'].map(t => (
                    <div key={t} className="flex items-start gap-2 text-sm"><WarnIcon /><span>{t}</span></div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t-2 border-ink">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="opacity-50">Verfügbar auf</span>
                    <span>Alle Produkte</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Preis</span>
                    <span className="text-olive">Kostenlos</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Ab Menge</span>
                    <span>10 Stück</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Siebdruck */}
            <div className="border-4 border-ink shadow-brutalist-lg bg-white flex flex-col">
              <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                <span className="font-serif font-black text-xl italic">Siebdruck</span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-sun text-ink px-2 py-1">Ab 150 Stk</span>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <p className="text-[11px] uppercase tracking-widest font-black opacity-50">Screenprint / Siebdruckverfahren</p>
                <p className="text-sm leading-relaxed">
                  Druckfarbe wird durch eine feine Schablone (Sieb) direkt auf den Stoff gedrückt. Pro Farbe eine separate Schablone — deshalb besonders langlebig und farbstark.
                </p>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50 pt-2">Vorteile</p>
                  {['Extrem langlebig & farbstabil', 'Industriewaschfest bis 60°C', 'Kräftige, deckende Farben', 'T-Shirt: kostenlos als Angebot'].map(t => (
                    <div key={t} className="flex items-start gap-2 text-sm"><CheckIcon /><span>{t}</span></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Hinweise</p>
                  {['Mindestmenge: 150 Stück', 'Pro Farbe eine Schablone — ideal für 1–3 Farben', '+3,00€/Stk auf allen Produkten außer T-Shirt'].map(t => (
                    <div key={t} className="flex items-start gap-2 text-sm"><WarnIcon /><span>{t}</span></div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t-2 border-ink">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="opacity-50">Verfügbar auf</span>
                    <span>Alle Produkte</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Preis T-Shirt</span>
                    <span className="text-olive">Kostenlos ✦ Angebot</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Preis andere</span>
                    <span className="text-tomato">+3,00€ / Stück</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Ab Menge</span>
                    <span>150 Stück</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bestickung */}
            <div className="border-4 border-ink shadow-brutalist-lg bg-white flex flex-col">
              <div className="bg-ink text-white px-6 py-4 flex items-center justify-between">
                <span className="font-serif font-black text-xl italic">Bestickung</span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-tomato text-white px-2 py-1">Premium</span>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <p className="text-[11px] uppercase tracking-widest font-black opacity-50">Embroidery / Direktstickerei</p>
                <p className="text-sm leading-relaxed">
                  Das Logo wird mit Stickgarn direkt ins Gewebe eingenäht — kein Aufkleber, kein Transfer. Gibt dem Textil einen exklusiven, dreidimensionalen Charakter.
                </p>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50 pt-2">Vorteile</p>
                  {['Kein Ausbleichen — dauerhaft haltbar', 'Industriewaschfest bis 60°C', 'Professioneller 3D-Effekt', 'Ideal für Fleece, Sweat & Schürzen'].map(t => (
                    <div key={t} className="flex items-start gap-2 text-sm"><CheckIcon /><span>{t}</span></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Hinweise</p>
                  {['Nicht auf T-Shirts verfügbar', 'Sehr feine Linien & Kleinsttext können unscharf werden (mind. 6 mm Buchstabenhöhe)', 'Lieferzeit verlängert sich leicht'].map(t => (
                    <div key={t} className="flex items-start gap-2 text-sm"><WarnIcon /><span>{t}</span></div>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t-2 border-ink">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="opacity-50">Verfügbar auf</span>
                    <span>Alle außer T-Shirt</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Brust Vorne</span>
                    <span className="text-tomato">+2,00€ / Stück</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Brust Hinten</span>
                    <span className="text-tomato">+3,00€ / Stück</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                    <span className="opacity-50">Ab Menge</span>
                    <span>10 Stück</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Druckpositionen ─── */}
      <section className="py-20 border-b-4 border-ink bg-white" id="positionen">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Wo sitzt das Logo? —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              Druckpositionen <span className="text-tomato">& Maße</span>
            </h2>
            <p className="mt-4 text-sm opacity-60 max-w-xl mx-auto">
              Alle Standardmaße unten. Abweichende Größen oder Positionen einfach als Notiz im Bestellformular angeben — wir stimmen uns per Korrekturabzug ab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* T-shirt Vorne */}
            <div className="border-4 border-ink p-6 flex flex-col items-center gap-4">
              <TshirtFrontSVG />
              <div className="w-full space-y-2 border-t-2 border-ink pt-4">
                <p className="font-black text-sm uppercase tracking-widest">T-Shirt Vorne</p>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Maß</span><span>10 × 10 cm</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Position</span><span>Brust links/mittig</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Technik</span><span>DTF · Siebdruck</span></div>
              </div>
            </div>

            {/* T-shirt Hinten */}
            <div className="border-4 border-ink p-6 flex flex-col items-center gap-4">
              <TshirtBackSVG />
              <div className="w-full space-y-2 border-t-2 border-ink pt-4">
                <p className="font-black text-sm uppercase tracking-widest">T-Shirt Rücken</p>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Breite</span><span>max. 24 cm</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Position</span><span>Schulterblatt-Mitte</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Technik</span><span>DTF · Siebdruck</span></div>
              </div>
            </div>

            {/* Schürze */}
            <div className="border-4 border-ink p-6 flex flex-col items-center gap-4">
              <ApronSVG />
              <div className="w-full space-y-2 border-t-2 border-ink pt-4">
                <p className="font-black text-sm uppercase tracking-widest">Schürzen</p>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Maß</span><span>10 × 10 cm</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Position</span><span>Brust vorne</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Technik</span><span>DTF · Bestickung</span></div>
              </div>
            </div>

            {/* Kappe */}
            <div className="border-4 border-ink p-6 flex flex-col items-center gap-4">
              <CapSVG />
              <div className="w-full space-y-2 border-t-2 border-ink pt-4">
                <p className="font-black text-sm uppercase tracking-widest">Team-Kappe</p>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Maß</span><span>ca. 7 × 5 cm</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Position</span><span>Vorderpanel mittig</span></div>
                <div className="flex justify-between text-[10px] font-bold"><span className="opacity-50">Technik</span><span>DTF · Bestickung</span></div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-2 border-ink bg-sun/30 p-5 text-sm leading-relaxed">
            <p><strong>Abweichende Maße möglich:</strong> Möchten Sie ein kleineres Logo auf der Brust, einen größeren Rückendruck oder eine andere Position? Geben Sie die gewünschten Maße einfach als Notiz im Bestellformular an. Wir bestätigen alles im Korrekturabzug vor der Produktion.</p>
          </div>
        </div>
      </section>

      {/* ─── Ablauf / Prozess ─── */}
      <section className="py-20 border-b-4 border-ink" id="ablauf">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Von der Bestellung zur Lieferung —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              Unser <span className="text-tomato">Ablauf</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                nr: '01', title: 'Bestellung', color: 'bg-sun',
                text: 'Produkte, Mengen und Druckoption wählen. Logo hochladen (Vektordatei bevorzugt) oder per E-Mail nachsenden.',
              },
              {
                nr: '02', title: 'Korrekturabzug', color: 'bg-tomato text-white',
                text: 'Wir platzieren Ihr Logo auf einer digitalen Druckvorschau und senden Sie Ihnen zur Prüfung zu. Korrekturen kostenlos.',
              },
              {
                nr: '03', title: 'Freigabe', color: 'bg-olive text-white',
                text: 'Erst nach Ihrer ausdrücklichen Freigabe starten wir mit der Produktion. Kein Risiko fehlplatzierter Logos.',
              },
              {
                nr: '04', title: 'Lieferung', color: 'bg-ink text-white',
                text: 'Versand per DHL oder DPD mit Sendungsverfolgung. Deutschlandweit. T-Shirts & Schürzen: 1–2 Wochen, Sweat/Fleece/Kappen: 3–4 Wochen.',
              },
            ].map((step) => (
              <div key={step.nr} className="border-4 border-ink flex flex-col">
                <div className={`${step.color} px-5 py-4 border-b-4 border-ink`}>
                  <span className="font-serif font-black text-4xl italic tracking-tighter">{step.nr}</span>
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
          <div className="text-center mb-14">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Dateiformate & Anforderungen —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              Ihr <span className="text-tomato">Logo</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-4 border-ink p-8 space-y-5">
              <p className="font-black text-sm uppercase tracking-widest">Ideale Formate</p>
              <div className="space-y-3">
                {[
                  { fmt: 'Ai · EPS · PDF', label: 'Vektordatei — Optimal', sub: 'Skalierungsfrei, verlustfrei, für alle Techniken geeignet', badge: 'Empfohlen', color: 'bg-olive text-white' },
                  { fmt: 'PNG · JPG', label: 'Rasterdatei', sub: 'Mindestens 300 dpi bei Endgröße. Für Siebdruck weniger geeignet.', badge: 'Möglich', color: 'bg-sun text-ink' },
                  { fmt: 'SVG', label: 'Vektordatei', sub: 'Webformat, funktioniert gut für einfache Logos.', badge: 'Möglich', color: 'bg-sun text-ink' },
                ].map(f => (
                  <div key={f.fmt} className="flex items-start gap-4 border-2 border-ink p-3">
                    <div className="font-black text-xs uppercase bg-paper border border-ink px-2 py-1 flex-shrink-0">{f.fmt}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">{f.label}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 ${f.color}`}>{f.badge}</span>
                      </div>
                      <p className="text-[11px] opacity-60 mt-0.5">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-4 border-ink p-8 space-y-4">
                <p className="font-black text-sm uppercase tracking-widest">Für Bestickung speziell</p>
                <ul className="space-y-3 text-sm">
                  {[
                    'Buchstabenhöhe mindestens 6 mm — kleinere Texte werden unscharf',
                    'Keine Verläufe oder Farbverläufe — Stickgarn bildet keine Übergänge',
                    'Sehr feine Linien (unter 1 mm) werden weggelassen oder vereinfacht',
                    'Wir informieren Sie im Korrekturabzug über etwaige Anpassungen',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-2"><WarnIcon /><span>{t}</span></li>
                  ))}
                </ul>
              </div>

              <div className="border-4 border-sun bg-sun/20 p-6 shadow-brutalist space-y-3">
                <p className="font-black text-sm uppercase tracking-widest">Kein Vektorlogo?</p>
                <p className="text-sm leading-relaxed">
                  Falls Ihr Logo nur als Foto, Screenshot oder niedrig aufgelöstes JPEG vorliegt, können Sie beim Bestellen unseren <strong>Logo-Erstellungsservice</strong> für <strong>100 €</strong> dazubuchen.
                </p>
                <p className="text-[11px] opacity-60">
                  Wir vermitteln Ihnen einen Partner-Grafiker, der Ihr Logo professionell vektorisiert. Die Vektorisierung wird direkt im Bestellprozess abgewickelt. Kittelwerk erbringt diese Leistung nicht in Eigenregie.
                </p>
                <Link href="/produkte" className="inline-block mt-2 bg-ink text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:bg-tomato transition-all shadow-brutalist">
                  Zum Bestellen →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pflege ─── */}
      <section className="py-20 border-b-4 border-ink" id="pflege">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Langlebigkeit sichern —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl uppercase italic tracking-tighter mt-2 leading-none">
              Pflege <span className="text-tomato">& Haltbarkeit</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'DTF-Druck',
                color: 'bg-ink text-white',
                tips: [
                  'Maximal 30–40°C waschen',
                  'Stets auf links drehen vor dem Waschen',
                  'Kein Wäschetrockner — Hitze schadet dem Transfer',
                  'Kein Bleichmittel',
                  'Nach ca. 20 Wäschen kann die Farbintensität leicht nachlassen — technische Eigenart des Verfahrens',
                ],
              },
              {
                title: 'Siebdruck',
                color: 'bg-olive text-white',
                tips: [
                  'Bis 60°C waschbar (industriewaschfest)',
                  'Auf links drehen empfohlen',
                  'Trockner auf niedriger Stufe möglich',
                  'Kein Bleichmittel',
                  'Besonders langlebig — für Profibetriebe mit häufigem Wäschewechsel ideal',
                ],
              },
              {
                title: 'Bestickung',
                color: 'bg-tomato text-white',
                tips: [
                  'Bis 60°C waschbar',
                  'Schonwaschgang empfohlen',
                  'Auf links drehen schützt die Stickerei',
                  'Kein Bleichmittel',
                  'Bläst niemals aus — Stickgarn behält dauerhaft seine Farbe',
                ],
              },
            ].map(c => (
              <div key={c.title} className="border-4 border-ink">
                <div className={`${c.color} px-6 py-4 border-b-4 border-ink`}>
                  <span className="font-black text-sm uppercase tracking-widest">{c.title}</span>
                </div>
                <ul className="p-6 space-y-3">
                  {c.tips.map(t => (
                    <li key={t} className="flex items-start gap-2 text-sm"><CheckIcon /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 border-4 border-ink bg-sun/30 p-6">
            <p className="font-black text-sm uppercase tracking-widest mb-3">Sweatshirt — angeraute Variante (Fleece-Innenseite)</p>
            <p className="text-sm leading-relaxed">
              Der angeraute Wintersweat kann beim ersten direkten Hautkontakt leicht tassen. <strong>Empfehlung: Vor dem ersten Tragen einmal waschen.</strong> Auf links drehen, Schonprogramm 30°C. Danach ist der Stoff gesetzt und angenehm zu tragen.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Übersichtstabelle ─── */}
      <section className="py-20 border-b-4 border-ink bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Schnellübersicht —</span>
            <h2 className="font-serif font-black text-3xl md:text-5xl uppercase italic tracking-tighter mt-2 leading-none">
              Alle Techniken <span className="text-tomato">im Vergleich</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-ink text-sm">
              <thead>
                <tr className="bg-ink text-white">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Eigenschaft</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-white/20">DTF-Druck</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Siebdruck</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Bestickung</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Mindestmenge', '10 Stk', '150 Stk', '10 Stk'],
                  ['Preis', 'Kostenlos', 'Kostenlos (T-Shirt) / +3€', '+2€ vorne / +3€ hinten'],
                  ['Waschtemperatur', '30–40°C', 'bis 60°C', 'bis 60°C'],
                  ['Haltbarkeit', 'Sehr gut', 'Ausgezeichnet', 'Ausgezeichnet'],
                  ['Farbtiefe', 'Vollfarbig', '1–3 Farben optimal', 'Stickgarnfarben'],
                  ['Auf T-Shirt', '✓', '✓', '✗'],
                  ['Auf Schürzen/Kappen', '✓ (nur vorne)', '✓ (nur vorne)', '✓ (nur vorne)'],
                  ['Auf Sweat/Fleece', '✓', '✓', '✓'],
                ].map(([prop, dtf, sieb, best], i) => (
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">— Häufige Fragen —</span>
            <h2 className="font-serif font-black text-4xl md:text-5xl uppercase italic tracking-tighter mt-2 leading-none">
              Noch <span className="text-tomato">Fragen?</span>
            </h2>
          </div>
          <div className="border-t-2 border-ink">
            {[
              {
                q: 'Was unterscheidet DTF-Druck von Siebdruck?',
                a: 'DTF ist ein digitales Verfahren — ideal für bunte, detailreiche Logos ab 10 Stück, ohne Aufpreis. Siebdruck verwendet eine physische Schablone pro Farbe: robuster, industriewaschfest, aber erst ab 150 Stück sinnvoll. Auf T-Shirts ist Siebdruck aktuell kostenlos als Sonderangebot.',
              },
              {
                q: 'Wie groß wird mein Logo gedruckt?',
                a: 'Standard Brust vorne: 10×10 cm. Standard Rücken: max. 24 cm Breite. Möchten Sie ein kleineres oder größeres Logo? Einfach als Notiz im Bestellformular angeben — wir stimmen die genaue Platzierung im Korrekturabzug ab.',
              },
              {
                q: 'Wann sehe ich, wie das Logo auf dem Textil aussieht?',
                a: 'Nach der Bestellung erstellen wir kostenlos eine digitale Druckvorschau (Korrekturabzug) und senden sie Ihnen per E-Mail. Die Produktion startet ausschließlich nach Ihrer Freigabe. Änderungswünsche sind möglich.',
              },
              {
                q: 'Kann ich Bestickung auf T-Shirts haben?',
                a: 'Nein. Bestickung ist technisch und ästhetisch auf dünneren Stoffen wie T-Shirts nicht empfehlenswert — der Stoff verformt sich unter der Stickdichte. Bestickung ist verfügbar auf Sweatshirts, Fleece-Jacken, Schürzen und Kappen.',
              },
              {
                q: 'Mein Logo hat sehr feine Details — ist das ein Problem?',
                a: 'Für DTF und Siebdruck ist das in der Regel kein Problem. Für Bestickung gilt: Buchstaben unter 6 mm Höhe und Linien unter 1 mm Breite können unscharf oder unleserlich wirken. Wir teilen Ihnen im Korrekturabzug mit, wenn eine Vereinfachung sinnvoll ist.',
              },
              {
                q: 'Ich habe nur ein Foto meines Logos — was tun?',
                a: 'Kein Problem. Sie können beim Bestellen unseren Logo-Erstellungsservice für 100 € dazubuchen. Wir vermitteln einen Partner-Grafiker, der Ihr Logo professionell in eine skalierbare Vektordatei umwandelt. Kittelwerk übernimmt die Koordination.',
              },
              {
                q: 'Wie wasche ich meine bedruckten Textilien richtig?',
                a: 'DTF-Druck: Max. 30–40°C, auf links drehen, kein Trockner. Siebdruck: bis 60°C, auf links drehen empfohlen. Bestickung: bis 60°C, Schonwaschgang. Sweatshirt (angeraut): Vor dem ersten Tragen einmal waschen — die Innenfaser kann sonst beim ersten Kontakt tassen.',
              },
              {
                q: 'Wie lange hält der DTF-Druck?',
                a: 'Bei sachgemäßer Pflege hält DTF-Druck viele Jahre. Nach etwa 20 oder mehr Wäschen kann die Farbintensität leicht nachlassen — das ist eine technische Eigenheit aller Transferdruckverfahren. Für extreme Beanspruchung (Industriewäsche, täglicher Betrieb) empfehlen wir Siebdruck oder Bestickung.',
              },
            ].map((item, i) => (
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">— Bereit? —</span>
            <h2 className="font-serif font-black text-4xl md:text-6xl italic tracking-tighter mt-4 mb-6 leading-none">
              Ihr Logo. Auf<br /><span className="text-sun">jedem Textil.</span>
            </h2>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
              Wählen Sie Ihre Produkte, laden Sie Ihr Logo hoch — wir kümmern uns um den Rest. Deutschlandweiter Versand, Korrekturabzug inklusive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/produkte"
                className="bg-tomato text-white font-black uppercase px-8 py-4 hover:bg-sun hover:text-ink transition-all shadow-[4px_4px_0px_0px_#FAFBF7] hover:shadow-none hover:translate-x-1 hover:translate-y-1 tracking-widest text-sm">
                Jetzt bestellen →
              </Link>
              <a href="mailto:info@kittelwerk.de"
                className="border-2 border-white text-white font-black uppercase px-8 py-4 hover:bg-white hover:text-ink transition-all tracking-widest text-sm">
                Frage stellen
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
