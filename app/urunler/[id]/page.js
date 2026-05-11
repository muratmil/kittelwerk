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
      url: `https://kittelwerk.de/urunler/${params.id}`,
    },
    alternates: {
      canonical: `https://kittelwerk.de/urunler/${params.id}`,
    },
  };
}

export function generateStaticParams() {
  return PRODUCTS.map(p => ({ id: p.id }));
}

export default function Page({ params }) {
  const product = PRODUCTS.find(p => p.id === params.id);
  if (!product) notFound();
  return <ProductDetailPage product={product} />;
}
