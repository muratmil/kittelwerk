import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Impressum — Kittelwerk',
};

export default function Impressum() {
  return (
    <main className="bg-paper min-h-screen">
      <Navbar />
      <section className="py-32 container mx-auto px-6 max-w-3xl">
        <span className="text-tomato font-black uppercase tracking-[0.3em] text-[10px]">Rechtliches</span>
        <h1 className="font-serif font-black text-6xl md:text-8xl mt-6 mb-16 italic tracking-tighter leading-none">
          Impressum.
        </h1>

        <div className="space-y-10 text-base leading-relaxed">

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Angaben gemäß § 5 DDG</h2>
            <p className="text-ink/80">
              Mil Werbung &amp; Marketing<br />
              Inhaber: Mustafa Mil (Einzelunternehmen)<br />
              Gleiwitzer Weg 1<br />
              31157 Sarstedt<br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Kontakt</h2>
            <p className="text-ink/80">
              E-Mail:{' '}
              <a href="mailto:info@kittelwerk.de" className="underline hover:text-tomato transition-colors">
                info@kittelwerk.de
              </a>
            </p>
            <p className="text-ink/60 text-sm mt-2">
              Für eine schnelle elektronische Kontaktaufnahme genügt die Angabe einer gültigen E-Mail-Adresse.
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Umsatzsteuer</h2>
            <p className="text-ink/80">
              Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen (Kleinunternehmer).
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Verantwortlich für den Inhalt</h2>
            <p className="text-ink/80">
              Mil Werbung &amp; Marketing<br />
              Mustafa Mil<br />
              Gleiwitzer Weg 1<br />
              31157 Sarstedt
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Streitschlichtung</h2>
            <p className="text-ink/80">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-tomato transition-colors"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="text-ink/80 mt-3">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Haftung für Inhalte</h2>
            <p className="text-ink/80">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
            <p className="text-ink/80 mt-3">
              Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Haftung für Links</h2>
            <p className="text-ink/80">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Urheberrecht</h2>
            <p className="text-ink/80">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">Hinweis zum Angebot</h2>
            <p className="text-ink/80">
              Kittelwerk ist ein Anbieter für hochwertige Gastro-Textilien mit individuellem Logo-Druck. Das Angebot richtet sich ausschließlich an gewerbliche Kunden (B2B). Ausführliche Informationen zum Datenschutz finden Sie in unserer Datenschutzerklärung.
            </p>
          </div>

          <div>
            <h2 className="font-serif font-black text-xl mb-3">AGB</h2>
            <p className="text-ink/80">
              Unsere Allgemeinen Geschäftsbedingungen finden Sie{' '}
              <a href="/agb" className="underline hover:text-tomato transition-colors">hier</a>.
            </p>
          </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}
