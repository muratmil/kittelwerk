import KategorieClient from '../KategorieClient';
import { createPublicClient } from '@/utils/supabase/public';
import { loadCatalog } from '@/lib/catalog';
import { kategorieBySlug } from '@/data/kategorien';
import { alternates } from '@/lib/i18n/config';

// Kategori sayfası — metinler sözlükte (`kategorien.arbeitskleidung`), her dilde ayrı.
export const revalidate = 60;

const SLUG = 'arbeitskleidung';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const kategorie = kategorieBySlug(SLUG, lang);
  const alt = alternates(lang, `/produkte/${SLUG}`);
  return {
    title: kategorie.title,
    description: kategorie.description,
    alternates: alt,
    openGraph: { title: kategorie.title, description: kategorie.description, url: alt.canonical },
  };
}

export default async function Seite({ params }) {
  const { lang } = await params;
  const { products } = await loadCatalog(createPublicClient(), { siteId: 'kittelwerk', lang });
  return <KategorieClient kategorie={kategorieBySlug(SLUG, lang)} products={products} />;
}
