import { createPublicClient } from '@/utils/supabase/public';

// Ürünler veritabanından: yeni ürün eklendiğinde site haritasına elle satır
// eklemek gerekmiyor, `products` tablosuna düşen her ürün buraya da düşer.
export default async function sitemap() {
  const base = 'https://www.kittelwerk.de';
  const now = new Date();

  const { data: produkte } = await createPublicClient()
    .from('products').select('id').eq('site_id', 'kittelwerk').eq('active', true).order('sort_order');

  const productPages = (produkte ?? []).map(p => ({
    url: `${base}/produkte/${p.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    { url: base,                         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/produkte`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${base}/kontakt`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/ueber-uns`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/druckinfo`,          lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/lieferbedingungen`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/impressum`,          lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    ...productPages,
  ];
}
