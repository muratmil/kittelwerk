export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/backend', '/atolye', '/api'],
    },
    sitemap: 'https://kittelwerk.de/sitemap.xml',
  };
}
