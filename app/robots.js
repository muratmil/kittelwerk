export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Portalın tamamı arama motorlarına kapalı. Eskiden /reseller ve
      // /verkauf açıkta kalmıştı; kayıt sayfaları da indekslenmesin.
      disallow: [
        '/api',
        '/login',
        '/admin',
        '/bestellung',
        '/werkstatt',
        '/haendler',
        '/konto',
        '/backend',
        '/atolye',
        '/reseller',
        '/verkauf',
      ],
    },
    sitemap: 'https://www.kittelwerk.de/sitemap.xml',
  };
}
