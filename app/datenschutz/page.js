import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Datenschutz() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 font-bold text-sm mb-10 hover:text-tomato transition-colors">← Startseite</a>
        <h1 className="font-serif font-black text-5xl italic tracking-tighter mb-4">Datenschutzerklärung</h1>
        <hr className="border-2 border-ink mb-8" />
        <h2 className="font-serif font-black text-xl mt-8 mb-3">1. Datenschutz auf einen Blick</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Diese Website erhebt personenbezogene Daten nur, wenn Sie uns diese aktiv mitteilen — z. B. über das Kontaktformular oder eine Bestellanfrage. Eine Weitergabe ohne Ihre Einwilligung erfolgt nicht.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">2. Hosting</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Gehostet bei Vercel Inc., San Francisco, USA. Details: <a href="https://vercel.com/legal/privacy-policy" target="_blank" className="text-tomato underline">Vercel Privacy Policy</a>.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">3. Kontaktformular</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Angaben aus dem Kontaktformular werden ausschließlich zur Bearbeitung Ihrer Anfrage gespeichert und nicht an Dritte weitergegeben.</p>
        <h2 className="font-serif font-black text-xl mt-8 mb-3">4. Ihre Rechte</h2>
        <p className="text-sm text-ink/70 leading-relaxed">Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Kontakt: info@kittelwerk.de</p>
        <hr className="border-2 border-ink mt-8 mb-4" />
        <p className="text-xs text-ink/50">Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen.</p>
      </div>
      <Footer />
    </main>
  );
}
