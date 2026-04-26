import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Impressum() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 font-bold text-sm mb-10 hover:text-tomato transition-colors">← Startseite</a>
        <h1 className="font-serif font-black text-5xl italic tracking-tighter mb-4">Impressum</h1>
        <hr className="border-2 border-ink mb-8" />
        <h2 className="font-serif font-black text-xl mt-8 mb-3">Angaben gemäß § 5 TMG</h2>
        <p className="text-sm text-ink/70 leading-relaxed">[Ihr Vorname Nachname / Firmenname]<br />[Straße und Hausnummer]<br />[PLZ] [Stadt]<br />Deutschland</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">Kontakt</h2>
        <p className="text-sm text-ink/70 leading-relaxed">E-Mail: <strong className="text-ink">info@kittelwerk.de</strong></p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">Umsatzsteuer-ID</h2>
        <p className="text-sm text-ink/70 leading-relaxed">USt-IdNr. gemäß § 27a UStG: [Ihre USt-IdNr.]</p>
        <hr className="border-2 border-ink mt-8 mb-4" />
        <p className="text-xs text-ink/50">Bitte ersetzen Sie alle Angaben in eckigen Klammern durch Ihre echten Daten.</p>
      </div>
      <Footer />
    </main>
  );
}
