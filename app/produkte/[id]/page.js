import { PRODUCTS } from '@/data/products';
import { notFound } from 'next/navigation';
import ProductDetailPage from './ProductDetailPage';

const PRODUCT_DESCRIPTIONS = {
  tshirt: 'Gastro T-Shirt aus 100% Baumwolle mit kostenlosem Logo-Druck. Ab 16€/Stk ab 10 Stück — Schw., Weiß, Rot. Lieferzeit 1–2 Wochen. Deutschlandweiter Versand.',
  sweat: 'Premium Sweatshirt 320g/m² für Gastronomie mit kostenlosem DTF-Druck. Ab 24€/Stk ab 10 Stück. Lieferzeit 3–4 Wochen. Deutschlandweiter Versand.',
  fleece: 'Fleece Jacke Anti-Pilling für Gastronomie mit Bestickung. Ab 24€/Stk ab 10 Stück. Lieferzeit 3–4 Wochen. Deutschlandweiter Versand.',
  apron: 'Vorbinder-Schürze Gastro — bügelleicht, Industriewäsche geeignet. Ab 12€/Stk ab 10 Stück. Lieferzeit 1–2 Wochen. Deutschlandweiter Versand.',
  latz: 'Latzschürze für Gastronomie — vollständige Abdeckung, verstellbarer Nackengurt. Ab 15€/Stk ab 10 Stück. Lieferzeit 1–2 Wochen. Deutschlandweiter Versand.',
  cap: 'Team-Kappe Gabardine für Gastronomie mit Bestickung. Ab 11€/Stk ab 10 Stück. Lieferzeit 3–4 Wochen. Deutschlandweiter Versand.',
  kochjacke: 'Kochjacke Profi-Twill 220g/m² mit Druckknöpfen — bald bei Kittelwerk. Bestickung & Logo-Druck ab 10 Stück. Industriewäsche geeignet. Deutschlandweiter Versand.',
  polo: 'Polo-Shirt Piqué 100% Baumwolle für Gastronomie & Service — bald bei Kittelwerk. Kostenloser Logo-Druck ab 10 Stück. Deutschlandweiter Versand.',
  hoodie: 'Premium Hoodie 320g/m² für Gastro-Teams — bald bei Kittelwerk. Kostenloser Logo-Druck vorne & hinten ab 10 Stück. Deutschlandweiter Versand.',
  bistro: 'Bistroschürze — lange Kellnerschürze aus Alpaka-Gewebe, bald bei Kittelwerk. Logo-Druck kostenlos ab 10 Stück. Industriewäsche geeignet. Deutschlandweiter Versand.',
  beanie: 'Strick-Beanie mit Logo-Bestickung für Gastro-Teams — bald bei Kittelwerk. Ab 10 Stück. Deutschlandweiter Versand.',
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return {};
  const description = PRODUCT_DESCRIPTIONS[product.id]
    || (product.tiers
      ? `${product.name} — ${product.desc}. Ab ${product.tiers[0].price.toFixed(2)}€ pro Stück inkl. kostenlosem Logo-Druck. Mindestbestellung 10 Stück. Deutschlandweiter Versand.`
      : `${product.name} — ${product.desc}. Bald bei Kittelwerk erhältlich. Kostenloser Logo-Druck ab 10 Stück. Deutschlandweiter Versand.`);
  return {
    title: `${product.name} | Kittelwerk`,
    description,
    openGraph: {
      title: `${product.name} | Kittelwerk`,
      description,
      url: `https://www.kittelwerk.de/produkte/${id}`,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
    },
    alternates: {
      canonical: `https://www.kittelwerk.de/produkte/${id}`,
    },
  };
}

export function generateStaticParams() {
  return PRODUCTS.map(p => ({ id: p.id }));
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) notFound();

  const priceValidUntil = new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.longDesc,
    image: `https://www.kittelwerk.de${product.image}`,
    sku: product.id,
    category: 'Gastro-Textilien',
    brand: { '@type': 'Brand', name: 'Kittelwerk', url: 'https://www.kittelwerk.de' },
    ...(product.tiers && {
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: product.tiers[product.tiers.length - 1].price,
        highPrice: product.tiers[0].price,
        priceCurrency: 'EUR',
        priceValidUntil,
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Kittelwerk' },
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kittelwerk', item: 'https://www.kittelwerk.de' },
      { '@type': 'ListItem', position: 2, name: 'Produkte', item: 'https://www.kittelwerk.de/produkte' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://www.kittelwerk.de/produkte/${product.id}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProductDetailPage product={product} />
    </>
  );
}
