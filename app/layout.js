import './globals.css';
import { Fraunces, DM_Sans } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['900'], style: ['italic'], variable: '--font-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-sans' });

export const metadata = {
  title: 'Kittelwerk | Gastro-Textilien Hannover & Niedersachsen',
  description: 'Gastro-Textilien direkt vom Hersteller — Schürzen, T-Shirts & Kappen inkl. kostenlosem Logo-Druck. Ab 10 Stück. Hannover & Niedersachsen.',
  keywords: 'Gastro Textilien Hannover, Schürzen kaufen Niedersachsen, Arbeitskleidung Gastronomie Hannover, Gastro T-Shirt bestellen, Kochschürze günstig, Berufskleidung Restaurant Hannover, Latzschürze Hannover',
  openGraph: {
    title: 'Kittelwerk | Gastro-Textilien Hannover & Niedersachsen',
    description: 'Gastro-Textilien direkt vom Hersteller — Schürzen, T-Shirts & Kappen inkl. kostenlosem Logo-Druck. Ab 10 Stück.',
    url: 'https://www.kittelwerk.de',
    siteName: 'Kittelwerk',
    locale: 'de_DE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.kittelwerk.de',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Kittelwerk',
  description: 'Gastro-Textilien direkt vom Hersteller für Gastronomie in Hannover und Niedersachsen',
  url: 'https://www.kittelwerk.de',
  email: 'info@kittelwerk.de',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Gleiwitzer Weg 1',
    addressLocality: 'Sarstedt',
    postalCode: '31157',
    addressRegion: 'Niedersachsen',
    addressCountry: 'DE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 52.2359,
    longitude: 9.8576,
  },
  areaServed: [
    { '@type': 'City', name: 'Hannover' },
    { '@type': 'AdministrativeArea', name: 'Niedersachsen' },
    { '@type': 'Country', name: 'Deutschland' },
  ],
  priceRange: '€',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className={`${fraunces.variable} ${dmSans.variable} font-sans bg-paper text-ink selection:bg-sun selection:text-ink`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
