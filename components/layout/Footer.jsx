export default function Footer() {
  return (
    <footer className="bg-ink text-white py-16 border-t-4 border-sun">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-2">
          <h3 className="font-serif font-black text-4xl mb-4 italic">Kittel<span className="text-tomato">werk</span>.</h3>
          <p className="text-paper/50 text-[10px] max-w-xs uppercase tracking-widest leading-loose">
            © 2026 Kittelwerk. Premium Gastro-Textilien.<br />
            Direkt ab Werk. Designed for Professionals.
          </p>
        </div>
        <div className="space-y-4 text-xs">
          <h4 className="font-bold text-sun uppercase tracking-widest">Rechtliches</h4>
          <ul className="space-y-2 font-medium opacity-80 uppercase tracking-tighter">
            <li><a href="/impressum" className="hover:text-tomato transition-colors">Impressum</a></li>
            <li><a href="/datenschutz" className="hover:text-tomato transition-colors">Datenschutz</a></li>
            <li><a href="/agb" className="hover:text-tomato transition-colors">AGB</a></li>
          </ul>
        </div>
        <div className="space-y-4 text-xs">
          <h4 className="font-bold text-sun uppercase tracking-widest">Navigation</h4>
          <ul className="space-y-2 font-medium opacity-80 uppercase tracking-tighter">
            <li><a href="/#produkte" className="hover:text-tomato transition-colors">Produkte</a></li>
            <li><a href="/#rechner" className="hover:text-tomato transition-colors">Ersparnis-Rechner</a></li>
            <li><a href="/ueber-uns" className="hover:text-tomato transition-colors">Über uns</a></li>
            <li><a href="/kontakt" className="hover:text-tomato transition-colors">Kontakt</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 border-t border-white/15 pt-6 flex flex-wrap justify-between gap-4 text-[10px] opacity-50">
        <span>info@kittelwerk.de</span>
        <span>Zahlung an deutsches Konto · 7–10 Werktage Lieferung</span>
      </div>
    </footer>
  );
}
