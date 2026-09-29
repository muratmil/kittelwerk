import '../globals.css';
import { notFound } from 'next/navigation';
import { Fraunces, DM_Sans, Playfair_Display, Inter } from 'next/font/google';
import { LOCALES, SPRACHEN, istSprache, alternates } from '@/lib/i18n/config';
import { woerterbuch } from '@/lib/i18n';
import { SpracheProvider } from '@/components/i18n/SpracheProvider';

// `latin-ext` Türkçe için şart (ğ ş ı İ).
// Rusça (Kiril) için Playfair Display & Inter kullanılır (aynı CSS değişkenleri).
const fraunces = Fraunces({ subsets: ['latin', 'latin-ext'], weight: ['900'], style: ['italic'], variable: '--font-serif' });
const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '700'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['cyrillic', 'latin'], weight: ['900'], style: ['italic'], variable: '--font-serif' });
const inter = Inter({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '700'], variable: '--font-sans' });

// Her dil derleme anında üretiliyor; listede olmayan ön ek 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = woerterbuch(lang).meta.site;
  return {
    metadataBase: new URL('https://www.kittelwerk.de'),
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: alternates(lang, '/'),
    openGraph: {
      title: m.title,
      description: m.description,
      url: alternates(lang, '/').canonical,
      siteName: 'Kittelwerk',
      locale: SPRACHEN[lang]?.og ?? 'de_DE',
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => SPRACHEN[l]?.og).filter(Boolean),
      type: 'website',
      images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: m.ogAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/images/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function localBusinessSchema(lang) {
  const t = woerterbuch(lang).meta.schema;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Kittelwerk',
    description: t.description,
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
    paymentAccepted: 'SEPA, Kreditkarte, PayPal',
    currenciesAccepted: 'EUR',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.catalog,
      itemListElement: t.offers.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();

  const serifVar = lang === 'ru' ? playfair.variable : fraunces.variable;
  const sansVar = lang === 'ru' ? inter.variable : dmSans.variable;

  return (
    <html lang={lang} className="scroll-smooth">
      <body className={`${serifVar} ${sansVar} font-sans bg-paper text-ink selection:bg-sun selection:text-ink`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(lang)) }}
        />
        <SpracheProvider lang={lang}>{children}</SpracheProvider>
      </body>
    </html>
  );
}
