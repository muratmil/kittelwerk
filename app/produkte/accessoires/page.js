import KategorieClient from '../KategorieClient';
import { createPublicClient } from '@/utils/supabase/public';
import { loadCatalog } from '@/lib/catalog';
import { kategorieBySlug } from '@/data/kategorien';

// Kategori sayfası — metinler `data/kategorien.js` içinde (2026-09-23).
export const revalidate = 60;

const kategorie = kategorieBySlug('accessoires');
const url = 'https://www.kittelwerk.de/produkte/accessoires';

export const metadata = {
  title: kategorie.title,
  description: kategorie.description,
  alternates: { canonical: url },
  openGraph: { title: kategorie.title, description: kategorie.description, url },
};

export default async function Seite() {
  const { products } = await loadCatalog(createPublicClient(), { siteId: 'kittelwerk' });
  return <KategorieClient kategorie={kategorie} products={products} />;
}
