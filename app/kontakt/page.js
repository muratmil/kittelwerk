import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Kontakt() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="inline-flex items-center gap-2 font-bold text-sm mb-10 hover:text-tomato transition-colors">← Startseite</a>
        <h1 className="font-serif font-black text-5xl italic tracking-tighter mb-4">Kontakt</h1>
        <p className="text-ink/70 mb-8">Wir antworten innerhalb von 24 Stunden — Montag bis Freitag.</p>
        <hr className="border-2 border-ink mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif font-black text-2xl mb-6">Schreiben Sie uns</h3>
            <form className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">Name</label>
                <input type="text" className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">E-Mail</label>
                <input type="email" className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">Restaurant / Firma</label>
                <input type="text" className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest">Nachricht</label>
                <textarea rows={5} className="border-2 border-ink p-3 bg-paper focus:bg-sun outline-none resize-none" required />
              </div>
              <button type="submit" className="w-full bg-ink text-white py-4 font-black uppercase hover:bg-tomato transition-all shadow-brutalist active:translate-x-1 active:translate-y-1">
                Absenden
              </button>
            </form>
          </div>
          <div className="space-y-6">
            <h3 className="font-serif font-black text-2xl mb-4">Direkt erreichen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3"><strong className="w-20 flex-shrink-0">E-Mail</strong><span className="text-ink/70">info@kittelwerk.de</span></div>
              <div className="flex gap-3"><strong className="w-20 flex-shrink-0">Versand</strong><span className="text-ink/70">7–10 Werktage · DHL/DPD</span></div>
              <div className="flex gap-3"><strong className="w-20 flex-shrink-0">Zahlung</strong><span className="text-ink/70">SEPA auf deutsches Konto</span></div>
            </div>
            <div className="bg-sun border-4 border-ink p-5 shadow-brutalist">
              <p className="font-black text-sm uppercase mb-2">Logo einsenden</p>
              <p className="text-sm">Bitte senden Sie Ihr Logo als Vektordatei (Ai / EPS / PDF) an <strong>info@kittelwerk.de</strong></p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
