import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Lieferbedingungen | Kittelwerk',
  description: 'Versandkosten, Lieferzeiten und Zahlungsbedingungen bei Kittelwerk — Gastro-Textilien mit deutschlandweitem Versand.',
  alternates: { canonical: 'https://www.kittelwerk.de/lieferbedingungen' },
  robots: { index: true, follow: true },
};

export default function Lieferbedingungen() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />

      <section className="py-24 container mx-auto px-6 max-w-3xl">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">Versand & Zahlung</span>
        <h1 className="font-serif font-black text-5xl md:text-7xl mt-4 mb-16 italic tracking-tighter leading-none">
          Liefer&shy;bedingungen
        </h1>

        <div className="space-y-12">

          {/* Lieferzeiten */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">Lieferzeiten</h2>
            <div className="space-y-3 text-sm font-medium leading-relaxed">
              <div className="flex items-start gap-4 border-2 border-ink p-4">
                <span className="bg-olive text-white font-black text-[9px] uppercase px-2 py-1 whitespace-nowrap mt-0.5">1–2 Wochen</span>
                <div>
                  <p className="font-black uppercase tracking-wide text-[11px] mb-1">T-Shirts & Schürzen</p>
                  <p className="opacity-60">Gastro T-Shirt · Latzschürze · Vorbinder-Schürze</p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-2 border-ink p-4">
                <span className="bg-sun text-ink font-black text-[9px] uppercase px-2 py-1 whitespace-nowrap mt-0.5">3–4 Wochen</span>
                <div>
                  <p className="font-black uppercase tracking-wide text-[11px] mb-1">Sweatshirts, Fleece & Kappen</p>
                  <p className="opacity-60">Premium Sweatshirt · Fleece Jacke · Team-Kappe</p>
                </div>
              </div>
              <p className="text-[11px] opacity-50 mt-3">
                Alle Lieferzeiten gelten ab Zahlungseingang. Versand per DHL oder DPD mit Sendungsverfolgung.
              </p>
            </div>
          </div>

          {/* Versandkosten */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">Versandkosten</h2>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 border-2 border-ink">
                <div className="p-3 border-r-2 border-ink font-black text-[11px] uppercase tracking-wide bg-ink/5">Bestellwert</div>
                <div className="p-3 font-black text-[11px] uppercase tracking-wide bg-ink/5">Versandkosten</div>
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
                <div className="p-3 border-r-2 border-ink font-black">ab 300 €</div>
                <div className="p-3 font-black text-tomato">Kostenlos</div>
              </div>
            </div>
            <p className="text-[11px] opacity-50 mt-3">Deutschlandweiter Versand. Lieferung ins Ausland auf Anfrage.</p>
          </div>

          {/* Zahlung */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">Zahlung</h2>
            <div className="space-y-3 text-sm font-medium leading-relaxed opacity-80">
              <p>Zahlung per <strong>SEPA-Überweisung</strong> auf deutsches Konto.</p>
              <p>Nach Auftragsbestätigung erhalten Sie eine Rechnung mit USt. per E-Mail. Die Fertigung beginnt nach Zahlungseingang.</p>
              <p>Keine Auslandsüberweisung. Keine Vorkasse per PayPal oder Kreditkarte.</p>
            </div>
          </div>

          {/* Bestellprozess */}
          <div className="border-l-8 border-ink pl-8">
            <h2 className="font-serif font-black text-2xl italic tracking-tight mb-4">Bestellprozess</h2>
            <ol className="space-y-3 text-sm font-medium">
              {[
                ['1', 'Bestellung aufgeben', 'Produkte, Farben, Mengen und Druckoptionen auswählen.'],
                ['2', 'Logo einsenden', 'Logo als Vektordatei (Ai, EPS, PDF) an info@kittelwerk.de senden.'],
                ['3', 'Angebot erhalten', 'Verbindliches Angebot binnen 24 Stunden per E-Mail.'],
                ['4', 'Zahlung', 'SEPA-Überweisung — Fertigung beginnt nach Eingang.'],
                ['5', 'Fertigung & Versand', 'Produktion und Lieferung innerhalb der angegebenen Lieferzeit.'],
              ].map(([num, title, desc]) => (
                <li key={num} className="flex items-start gap-4">
                  <span className="bg-ink text-sun font-black text-sm w-8 h-8 flex items-center justify-center flex-shrink-0">{num}</span>
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
            <p className="font-black uppercase tracking-widest text-[10px] text-white/40 mb-2">Fragen?</p>
            <p className="font-serif font-black text-2xl italic tracking-tight leading-none mb-3">Wir helfen gerne weiter.</p>
            <a href="/kontakt" className="inline-block bg-tomato text-white font-black uppercase text-[11px] px-6 py-3 hover:bg-white hover:text-ink transition-all">
              Kontakt aufnehmen →
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
