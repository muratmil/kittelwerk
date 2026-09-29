import HomeClient from './HomeClient';
import { createPublicClient } from '@/utils/supabase/public';
import { loadCatalog } from '@/lib/catalog';
import { loadReferenzen } from '@/lib/referenzen';
import { woerterbuch } from '@/lib/i18n';

// Fiyatlar veritabanından geliyor. Sayfa ISR ile önbelleklenir; yönetimden
// yapılan fiyat değişikliği en geç bir dakika içinde vitrine yansır.
export const revalidate = 60;

// Google'ın SSS kutusu: sayfadaki SSS bölümüyle AYNI metin, aynı dilde
// (2026-09-29'dan beri tek kaynak: sözlükteki `faq.liste`).
function faqSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: woerterbuch(lang).faq.liste.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export default async function Home({ params }) {
  const { lang } = await params;
  const client = createPublicClient();
  // Ana sayfadaki referans şeridi: CCH'deki sıranın ilk altısı.
  const [{ products }, referenzen] = await Promise.all([
    loadCatalog(client, { siteId: 'kittelwerk', lang }),
    loadReferenzen(client, { limit: 6, lang }),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lang)) }} />
      <HomeClient products={products} referenzen={referenzen} />
    </>
  );
}
