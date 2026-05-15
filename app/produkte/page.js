import ProdukteClient from './ProdukteClient';

export const metadata = {
  title: 'Gastro-Textilien kaufen | Schürzen, T-Shirts & Kappen — Kittelwerk',
  description: 'Gastro-Textilien direkt vom Hersteller: Latzschürzen, T-Shirts, Kappen & mehr inkl. kostenlosem Logo-Druck. Ab 10 Stück. Deutschlandweiter Versand.',
  alternates: { canonical: 'https://www.kittelwerk.de/produkte' },
  openGraph: {
    title: 'Gastro-Textilien kaufen | Kittelwerk',
    description: 'Schürzen, T-Shirts & Kappen inkl. kostenlosem Logo-Druck. Ab 10 Stück.',
    url: 'https://www.kittelwerk.de/produkte',
  },
};

export default function ProduktePage() {
  return <ProdukteClient />;
}
