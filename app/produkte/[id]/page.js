import { PRODUCTS } from '@/data/products';
import { notFound } from 'next/navigation';
import ProductDetailPage from './ProductDetailPage';

export async function generateMetadata({ params }) {
  const product = PRODUCTS.find(p => p.id === params.id);
  if (!product) return {};
  return {
    title: `${product.name} | Kittelwerk`,
    description: `${product.name} — ${product.desc}. Ab ${product.tiers[0].price.toFixed(2)}€ pro Stück inkl. kostenlosem Logo-Druck. Mindestbestellung 10 Stück.`,
    openGraph: {
      title: `${product.name} | Kittelwerk`,
      description: `${product.name} — ${product.desc}. Ab ${product.tiers[0].price.toFixed(2)}€.`,
      url: `https://www.kittelwerk.de/produkte/${params.id}`,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
    },
    alternates: {
      canonical: `https://www.kittelwerk.de/produkte/${params.id}`,
    },
  };
}

export function generateStaticParams() {
  return PRODUCTS.map(p => ({ id: p.id }));
}

export default function Page({ params }) {
  const product = PRODUCTS.find(p => p.id === params.id);
  if (!product) notFound();

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.longDesc,
    image: `https://www.kittelwerk.de${product.image}`,
    brand: { '@type': 'Brand', name: 'Kittelwerk' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: product.tiers[product.tiers.length - 1].price,
      highPrice: product.tiers[0].price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Kittelwerk' },
    },
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
