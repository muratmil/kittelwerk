import { PRODUCTS } from '@/data/products';

export default function sitemap() {
  const base = 'https://www.kittelwerk.de';
  const now = new Date();

  const productPages = PRODUCTS.map(p => ({
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
