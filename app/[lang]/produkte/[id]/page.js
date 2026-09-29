import { notFound } from 'next/navigation';
import ProductDetailPage from './ProductDetailPage';
import { createPublicClient } from '@/utils/supabase/public';
import { loadCatalog } from '@/lib/catalog';
import { bildUrlAbsolut } from '@/lib/bildUrl';
import { woerterbuch, fuell } from '@/lib/i18n';
import { alternates, pfad, BASIS } from '@/lib/i18n/config';

// Fiyatlar veritabanindan; sayfa ISR ile tazeleniyor.
export const revalidate = 60;

async function ladeProdukt(id, lang) {
  const { products } = await loadCatalog(createPublicClient(), { includeInactive: true, siteId: 'kittelwerk', lang });
  // Adres ya görünen slug ya da eski kimlik olabilir: eski bağlantılar
  // (ve arama motorundaki kayıtlar) çalışmaya devam etmeli.
  return products.find((p) => p.slug === id) ?? products.find((p) => p.id === id) ?? null;
}

// Google açıklamaları sözlükte: `produkt.meta.texte.<ürün>` (her dilde).
// Listede olmayan yeni ürün kendi fiyatından otomatik bir cümle alır.
export async function generateMetadata({ params }) {
  const { id, lang } = await params;
  const product = await ladeProdukt(id, lang);
  if (!product) return {};
  const m = woerterbuch(lang).produkt.meta;
  const description = m.texte[product.id]
    || (product.tiers?.[0]?.price != null
      ? fuell(m.ab, { name: product.name, desc: product.desc, preis: Number(product.tiers[0].price).toFixed(2), min: product.minQty || 10 })
      : fuell(m.bald, { name: product.name, desc: product.desc }));
  const alt = alternates(lang, `/produkte/${product.slug ?? id}`);
  return {
    title: `${product.name} | Kittelwerk`,
    description,
    openGraph: {
      title: `${product.name} | Kittelwerk`,
      description,
      url: alt.canonical,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
    },
    alternates: alt,
  };
}

// Ürün listesi de veritabanından: kodda ürün kalmadı. Derleme anında
// okunuyor, sayfanın kendisi zaten aynı veritabanına gidiyor.
export async function generateStaticParams() {
  const { data } = await createPublicClient()
    .from('products').select('id, meta').eq('site_id', 'kittelwerk');
  // Önceden üretilen adres GÖRÜNEN adrestir; eski kimlik yönlendirmeyle çözülür.
  return (data ?? []).map((p) => ({ id: p.meta?.slug ?? p.id }));
}

export default async function Page({ params }) {
  const { id, lang } = await params;
  const product = await ladeProdukt(id, lang);
  if (!product) notFound();
  const L = woerterbuch(lang).liste;

  const priceValidUntil = new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.longDesc,
    image: bildUrlAbsolut(product.image),
    sku: product.id,
    category: woerterbuch(lang).meta.schema.catalog,
    brand: { '@type': 'Brand', name: 'Kittelwerk', url: 'https://www.kittelwerk.de' },
    ...(product.tiers?.length && product.tiers[0].price != null && {
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
      { '@type': 'ListItem', position: 1, name: 'Kittelwerk', item: `${BASIS}${pfad(lang, '/')}` },
      { '@type': 'ListItem', position: 2, name: L.produkte, item: `${BASIS}${pfad(lang, '/produkte')}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${BASIS}${pfad(lang, `/produkte/${product.slug ?? product.id}`)}` },
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
