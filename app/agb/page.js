import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AGB() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 font-bold text-sm mb-10 hover:text-tomato transition-colors">← Startseite</a>
        <h1 className="font-serif font-black text-5xl italic tracking-tighter mb-4">AGB</h1>
        <hr className="border-2 border-ink mb-8" />
        <h2 className="font-serif font-black text-xl mt-8 mb-3">§ 1 Geltungsbereich</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Diese AGB gelten für alle Bestellungen über kittelwerk.de. Vertragspartner: [Ihr Firmenname], [Adresse].</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">§ 2 Vertragsschluss</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Eine Bestellanfrage ist ein Angebot. Der Vertrag kommt erst mit schriftlicher Bestätigung und Rechnungsstellung zustande.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">§ 3 Preise und Zahlung</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Preise in Euro inkl. MwSt. Zahlung per SEPA-Überweisung auf das in der Rechnung angegebene deutsche Konto. Produktion beginnt nach Zahlungseingang.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">§ 4 Mindest- und Maximalbestellmenge</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Min. 10 Stück (kombinierbar), max. 100 Stück pro Bestellung.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">§ 5 Lieferung</h2>
        <p className="text-sm text-ink/70 leading-relaxed">7–10 Werktage nach Zahlungseingang. Lieferung per DHL/DPD innerhalb Deutschlands.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">§ 6 Widerrufsrecht</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Bei individuell bedruckten Waren besteht gemäß § 312g Abs. 2 Nr. 1 BGB kein Widerrufsrecht. Bei Mängeln gilt das gesetzliche Gewährleistungsrecht.</p>
        <hr className="border-2 border-ink mt-8 mb-4" />
        <p className="text-xs text-ink/50">Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen.</p>
      </div>
      <Footer />
    </main>
  );
}
