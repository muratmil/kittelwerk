import './globals.css';
import { Fraunces, DM_Sans } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['900'], style: ['italic'], variable: '--font-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-sans' });

export const metadata = {
  metadataBase: new URL('https://www.kittelwerk.de'),
  title: 'Kittelwerk | Gastro-Textilien Hannover & Niedersachsen',
  description: 'Gastro-Textilien direkt vom Hersteller — Schürzen, T-Shirts & Kappen inkl. kostenlosem Logo-Druck. Ab 10 Stück. Deutschlandweiter Versand.',
  keywords: 'Gastro Textilien Hannover, Schürzen kaufen Niedersachsen, Arbeitskleidung Gastronomie Hannover, Gastro T-Shirt bestellen, Kochschürze günstig, Berufskleidung Restaurant Hannover, Latzschürze Hannover',
  openGraph: {
    title: 'Kittelwerk | Gastro-Textilien Hannover & Niedersachsen',
    description: 'Gastro-Textilien direkt vom Hersteller — Schürzen, T-Shirts & Kappen inkl. kostenlosem Logo-Druck. Ab 10 Stück. Deutschlandweiter Versand.',
    url: 'https://www.kittelwerk.de',
    siteName: 'Kittelwerk',
    locale: 'de_DE',
    type: 'website',
    images: [{ url: '/images/toplutshirt.png', width: 1200, height: 630, alt: 'Kittelwerk Gastro-Textilien' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Kittelwerk',
  description: 'Gastro-Textilien direkt vom Hersteller für Gastronomie in Hannover und Niedersachsen',
  url: 'https://www.kittelwerk.de',
  email: 'info@kittelwerk.de',
  telephone: '+49-174-9623344',
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '17:00' },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lange Str. 21',
    addressLocality: 'Ronnenberg',
    postalCode: '30952',
    addressRegion: 'Niedersachsen',
    addressCountry: 'DE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 52.3197,
    longitude: 9.6558,
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
