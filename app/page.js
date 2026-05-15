import HomeClient from './HomeClient';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wie funktioniert die Bestellung?',
      acceptedAnswer: { '@type': 'Answer', text: 'Produkte und Mengen wählen, Anfrage absenden. Logo als Vektor (Ai/EPS/PDF) per Mail an info@kittelwerk.de. Verbindliches Angebot binnen 24 h. Nach Zahlung: Fertigung und Versand.' },
    },
    {
      '@type': 'Question',
      name: 'Was ist die Mindestbestellmenge?',
      acceptedAnswer: { '@type': 'Answer', text: 'Mindestens 10 Stück gesamt — verschiedene Produkte kombinierbar. Beispiel: 5 T-Shirts + 3 Schürzen + 2 Kappen = gültig.' },
    },
    {
      '@type': 'Question',
      name: 'Wie läuft die Zahlung ab?',
      acceptedAnswer: { '@type': 'Answer', text: 'SEPA-Überweisung auf deutsches Konto. Keine Auslandsüberweisung. Rechnung mit USt. per Mail.' },
    },
    {
      '@type': 'Question',
      name: 'Welche Druckoptionen gibt es?',
      acceptedAnswer: { '@type': 'Answer', text: 'DTF-Druck auf Front, Rückseite oder beides. Weich, dehnbar, waschmaschinenfest 60°C. Logo als Vektordatei einsenden — wir übernehmen den Rest.' },
    },
    {
      '@type': 'Question',
      name: 'Welche Größen gibt es?',
      acceptedAnswer: { '@type': 'Answer', text: 'T-Shirts und Sweatshirts in S, M, L, XL und 2XL. Schürzen und Kappen sind One-Size.' },
    },
    {
      '@type': 'Question',
      name: 'Wie lange dauert die Lieferung?',
      acceptedAnswer: { '@type': 'Answer', text: 'T-Shirts und Schürzen: 1–2 Wochen ab Zahlungseingang. Sweatshirts, Fleece-Jacken und Kappen: 3–4 Wochen. Versand per DHL oder DPD mit Sendungsverfolgung.' },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomeClient />
    </>
  );
}
