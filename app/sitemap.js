import { PRODUCTS } from '@/data/products';

export default function sitemap() {
  const base = 'https://kittelwerk.de';
  const now = new Date();

  const productPages = PRODUCTS.map(p => ({
    url: `${base}/produkte/${p.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    { url: base,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/kontakt`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/ueber-uns`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...productPages,
    { url: `${base}/agb`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/datenschutz`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/impressum`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
