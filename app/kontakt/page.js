import KontaktClient from './KontaktClient';

export const metadata = {
  title: 'Kontakt | Kittelwerk — Gastro-Textilien Hannover',
  description: 'Kontaktieren Sie Kittelwerk für Bestellungen, Großbestellungen oder Produktfragen. Deutschlandweiter Versand. Antwort innerhalb von 24 Stunden.',
  alternates: { canonical: 'https://www.kittelwerk.de/kontakt' },
  openGraph: {
    title: 'Kontakt | Kittelwerk',
    description: 'Bestellungen, Großbestellungen, Produktfragen — wir helfen Ihnen gerne weiter.',
    url: 'https://www.kittelwerk.de/kontakt',
  },
};

export default function KontaktPage() {
  return <KontaktClient />;
}
