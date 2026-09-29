import ProdukteClient from './ProdukteClient';
import { createPublicClient } from '@/utils/supabase/public';
import { loadCatalog } from '@/lib/catalog';
import { woerterbuch } from '@/lib/i18n';
import { alternates } from '@/lib/i18n/config';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = woerterbuch(lang).liste.meta;
  const alt = alternates(lang, '/produkte');
  return {
    title: m.title,
    description: m.description,
    alternates: alt,
    openGraph: { title: m.ogTitle, description: m.ogDescription, url: alt.canonical },
  };
}

export default async function ProduktePage({ params }) {
  const { lang } = await params;
  const { products } = await loadCatalog(createPublicClient(), { siteId: 'kittelwerk', lang });
  return <ProdukteClient products={products} />;
}
