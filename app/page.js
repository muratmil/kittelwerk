import HomeClient from './HomeClient';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wie funktioniert die Bestellung?',
      acceptedAnswer: { '@type': 'Answer', text: 'Produkte und Mengen wählen, Anfrage absenden und Logo hochladen. Wir senden einen digitalen Korrekturabzug zur Freigabe. Produktion startet erst nach Ihrer Freigabe.' },
    },
    {
      '@type': 'Question',
      name: 'Was ist die Mindestbestellmenge?',
      acceptedAnswer: { '@type': 'Answer', text: 'Mindestens 10 Stück gesamt — verschiedene Produkte kombinierbar. Beispiel: 5 T-Shirts + 3 Schürzen + 2 Kappen = gültig.' },
    },
    {
      '@type': 'Question',
      name: 'Welche Drucktechniken gibt es?',
      acceptedAnswer: { '@type': 'Answer', text: 'DTF-Druck: kostenlos, vollfarbig, ab 10 Stück. Siebdruck: ab 150 Stück, auf T-Shirts kostenlos. Bestickung: ab 10 Stück, +2€/Stk vorne. Alle Details auf kittelwerk.de/druckinfo.' },
    },
    {
      '@type': 'Question',
      name: 'Sehe ich das Logo vor der Produktion?',
      acceptedAnswer: { '@type': 'Answer', text: 'Ja — immer. Nach der Bestellung erhalten Sie einen kostenlosen digitalen Korrekturabzug. Produktion startet erst nach Ihrer Freigabe.' },
    },
    {
      '@type': 'Question',
      name: 'Welche Größen gibt es?',
      acceptedAnswer: { '@type': 'Answer', text: 'T-Shirts und Sweatshirts in XS, S, M, L, XL und 2XL. Schürzen und Kappen sind One-Size.' },
    },
    {
      '@type': 'Question',
      name: 'Wie lange dauert die Lieferung?',
      acceptedAnswer: { '@type': 'Answer', text: 'T-Shirts und Schürzen: 1–2 Wochen. Sweatshirts, Fleece-Jacken und Kappen: 3–4 Wochen. Deutschlandweiter Versand per DHL oder DPD mit Sendungsverfolgung.' },
    },
    {
      '@type': 'Question',
      name: 'Was ist, wenn ich kein Vektorlogo habe?',
      acceptedAnswer: { '@type': 'Answer', text: 'Logo-Erstellungsservice für 50€ dazubuchbar — wir vermitteln einen Partner-Grafiker zur professionellen Vektorisierung.' },
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
