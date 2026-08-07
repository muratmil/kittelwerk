// CCH'nin adresi tek yerde: taşınırsa burada bir satır değişir.
const CCH = 'https://www.gastrocollect.de';

/**
 * Yönetim adreslerinin tamamı → CCH.
 *
 * `:path*` olan ve olmayan hâlleri ayrı yazılmak zorunda: Next'te `/admin/:path*`
 * çıplak `/admin`'i YAKALAMAZ, ikisi de gerekiyor. Bu unutulursa kök adres
 * sessizce 404 döner — yönlendirme çalışıyor sanılır.
 */
function portalYonlendirmeleri() {
  // Portalın kittelwerk.de altındayken kullandığı adresler.
  const alanlar = ['admin', 'monitor', 'bestellung', 'werkstatt', 'haendler', 'is-takip', 'login'];

  // Dört panelli eski dünyadan kalan adresler → CCH'deki karşılıkları.
  const eski = {
    '/reseller/login':    '/login',
    '/verkauf/login':     '/login',
    '/atolye/login':      '/login',
    '/backend/login':     '/login',
    '/reseller/register': '/haendler/registrierung',
    '/atolye/kayit':      '/werkstatt/registrierung',
    '/reseller':          '/haendler',
    '/reseller/:path*':   '/haendler/:path*',
    '/atolye/merkez':     '/bestellung',
    '/atolye':            '/werkstatt',
    '/atolye/:path*':     '/werkstatt/:path*',
    '/backend':           '/admin',
    '/backend/:path*':    '/admin/:path*',
    // /verkauf tamamen kalktı: Vertrieb sipariş girmiyor.
    '/verkauf':           '/bestellung',
    '/verkauf/:path*':    '/bestellung',
  };

  return [
    ...alanlar.flatMap((a) => [
      { source: `/${a}`,        destination: `${CCH}/${a}`,        permanent: true },
      { source: `/${a}/:path*`, destination: `${CCH}/${a}/:path*`, permanent: true },
    ]),
    ...Object.entries(eski).map(([source, hedef]) => ({
      source, destination: `${CCH}${hedef}`, permanent: true,
    })),
  ];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'kittelwerk.de' }],
        destination: 'https://www.kittelwerk.de/:path*',
        permanent: true,
      },

      // --- Yönetim artık burada değil -------------------------------------
      // CCH kendi uygulamasına çıktı (gastrocollect.de). Bu dosyadaki her
      // yönetim adresi oraya gidiyor; kittelwerk.de yalnız dükkân.
      //
      // İki kuşak yer imi var ve ikisi de korunuyor:
      //   1) dört panelli eski dünya (/reseller, /atolye, /backend, /verkauf)
      //   2) portalın kittelwerk.de altındaki hâli (/admin, /haendler, …)
      // Hepsi kalıcı (308) — arama motorları da eski adresleri bıraksın.
      ...portalYonlendirmeleri(),
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
