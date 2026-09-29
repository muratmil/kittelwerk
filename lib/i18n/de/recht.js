// Yasal sayfalar. Almanca metin 2026-09-29'da sayfalardan BİREBİR taşındı —
// içerik değişikliği yok (taslak notları ve yer tutucular dahil; bkz. Murat'a
// bildirilen açıklar). Paragraflardaki {email} {odr} {agb} {vercel}
// bağlantıya çevriliyor (components/recht/RechtText.jsx).
export default {
  recht: {
    // Almanca'da not yok; diğer dillerde metnin başında çıkıyor.
    massgeblich: '',
    startseite: '← Startseite',
    rechtliches: 'Rechtliches',
    entwurf: 'Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen.',
    impressum: {
      metaTitle: 'Impressum — Kittelwerk',
      titel: 'Impressum.',
      abschnitte: [
        { h: 'Angaben gemäß § 5 DDG', adresse: ['Mil Werbung & Marketing', 'Inhaber: Mustafa Mil (Einzelunternehmen)', 'Gleiwitzer Weg 1', '31157 Sarstedt', 'Deutschland'] },
        { h: 'Kontakt', p: ['E-Mail: {email}'], klein: 'Für eine schnelle elektronische Kontaktaufnahme genügt die Angabe einer gültigen E-Mail-Adresse.' },
        { h: 'Umsatzsteuer', p: ['Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen (Kleinunternehmer).'] },
        { h: 'Verantwortlich für den Inhalt', adresse: ['Mil Werbung & Marketing', 'Mustafa Mil', 'Gleiwitzer Weg 1', '31157 Sarstedt'] },
        { h: 'Streitschlichtung', p: ['Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: {odr}', 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'] },
        { h: 'Haftung für Inhalte', p: ['Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.', 'Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.'] },
        { h: 'Haftung für Links', p: ['Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'] },
        { h: 'Urheberrecht', p: ['Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'] },
        { h: 'Hinweis zum Angebot', p: ['Kittelwerk ist ein Anbieter für hochwertige Gastro-Textilien mit individuellem Logo-Druck. Das Angebot richtet sich ausschließlich an gewerbliche Kunden (B2B). Ausführliche Informationen zum Datenschutz finden Sie in unserer Datenschutzerklärung.'] },
        { h: 'AGB', p: ['Unsere Allgemeinen Geschäftsbedingungen finden Sie {agb}.'] },
      ],
      agbLink: 'hier',
    },
    datenschutz: {
      metaTitle: 'Datenschutz | Kittelwerk',
      titel: 'Datenschutzerklärung',
      abschnitte: [
        { h: '1. Datenschutz auf einen Blick', p: ['Diese Website erhebt personenbezogene Daten nur, wenn Sie uns diese aktiv mitteilen — z. B. über das Kontaktformular oder eine Bestellanfrage. Eine Weitergabe ohne Ihre Einwilligung erfolgt nicht.'] },
        { h: '2. Hosting', p: ['Gehostet bei Vercel Inc., San Francisco, USA. Details: {vercel}.'] },
        { h: '3. Kontaktformular', p: ['Angaben aus dem Kontaktformular werden ausschließlich zur Bearbeitung Ihrer Anfrage gespeichert und nicht an Dritte weitergegeben.'] },
        { h: '4. Ihre Rechte', p: ['Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Kontakt: info@kittelwerk.de'] },
      ],
    },
    agb: {
      metaTitle: 'AGB | Kittelwerk',
      titel: 'AGB',
      abschnitte: [
        { h: '§ 1 Geltungsbereich', p: ['Diese AGB gelten für alle Bestellungen über kittelwerk.de. Vertragspartner: [Ihr Firmenname], [Adresse].'] },
        { h: '§ 2 Vertragsschluss', p: ['Eine Bestellanfrage ist ein Angebot. Der Vertrag kommt erst mit schriftlicher Bestätigung und Rechnungsstellung zustande.'] },
        { h: '§ 3 Preise und Zahlung', p: ['Preise in Euro inkl. MwSt. Zahlung per SEPA-Überweisung auf das in der Rechnung angegebene deutsche Konto. Produktion beginnt nach Zahlungseingang.'] },
        { h: '§ 4 Mindestbestellmenge', p: ['Min. 10 Stück (kombinierbar). Es gibt keine Obergrenze — auch Großbestellungen sind willkommen.'] },
        { h: '§ 5 Lieferung', p: ['1–2 Wochen nach Zahlungseingang. Lieferung per DHL/DPD innerhalb Deutschlands.'] },
        { h: '§ 6 Widerrufsrecht', p: ['Bei individuell bedruckten Waren besteht gemäß § 312g Abs. 2 Nr. 1 BGB kein Widerrufsrecht. Bei Mängeln gilt das gesetzliche Gewährleistungsrecht.'] },
      ],
    },
    liefer: {
      metaTitle: 'Lieferbedingungen | Kittelwerk',
      metaDescription: 'Versandkosten, Lieferzeiten und Zahlungsbedingungen bei Kittelwerk — Gastro-Textilien mit deutschlandweitem Versand.',
      kicker: 'Versand & Zahlung',
      titel: 'Liefer­bedingungen',
      lieferzeiten: 'Lieferzeiten',
      gruppen: [
        { zeit: '1–2 Wochen', titel: 'T-Shirts & Schürzen', produkte: 'Premium T-Shirt · Latzschürze · Vorbinder-Schürze' },
        { zeit: '3 Wochen', titel: 'Oversize T-Shirts', produkte: 'Oversize T-Shirt' },
        { zeit: '3–4 Wochen', titel: 'Sweatshirts, Fleece & Kappen', produkte: 'Premium Sweatshirt · Fleece Jacke · Team-Kappe' },
      ],
      zeitHinweis: 'Alle Lieferzeiten gelten ab Zahlungseingang. Versand per DHL oder DPD mit Sendungsverfolgung.',
      versandkosten: 'Versandkosten',
      bestellwert: 'Bestellwert',
      ab300: 'ab 300 €',
      kostenlos: 'Kostenlos',
      ausland: 'Deutschlandweiter Versand. Lieferung ins Ausland auf Anfrage.',
      zahlung: 'Zahlung',
      zahlung1a: 'Zahlung per ',
      zahlung1Stark: 'SEPA-Überweisung',
      zahlung1b: ', Kreditkarte oder PayPal möglich.',
      zahlung2: 'Nach Auftragsbestätigung erhalten Sie eine Rechnung mit USt. per E-Mail. Die Fertigung beginnt nach Zahlungseingang.',
      zahlung3: 'Keine Barzahlung. Keine Zahlung aus dem Ausland.',
      prozess: 'Bestellprozess',
      schritte: [
        ['Bestellung aufgeben', 'Produkte, Farben, Mengen und Druckoptionen auswählen.'],
        ['Logo einsenden', 'Logo als Vektordatei (Ai, EPS, PDF) an info@kittelwerk.de senden.'],
        ['Angebot erhalten', 'Verbindliches Angebot binnen 24 Stunden per E-Mail.'],
        ['Zahlung', 'SEPA-Überweisung — Fertigung beginnt nach Eingang.'],
        ['Fertigung & Versand', 'Produktion und Lieferung innerhalb der angegebenen Lieferzeit.'],
      ],
      fragen: 'Fragen?',
      helfen: 'Wir helfen gerne weiter.',
      kontakt: 'Kontakt aufnehmen →',
    },
  },
};
