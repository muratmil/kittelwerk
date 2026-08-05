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

      // Eski panel adresleri → portal. Mevcut kullanıcıların yer imleri
      // bozulmasın diye kalıcı (301) yönlendirme.
      { source: '/reseller/login',    destination: '/login', permanent: true },
      { source: '/verkauf/login',     destination: '/login', permanent: true },
      { source: '/atolye/login',      destination: '/login', permanent: true },
      { source: '/backend/login',     destination: '/login', permanent: true },

      { source: '/reseller/register', destination: '/haendler/registrierung',  permanent: true },
      { source: '/atolye/kayit',      destination: '/werkstatt/registrierung', permanent: true },

      { source: '/reseller',          destination: '/haendler',    permanent: true },
      { source: '/reseller/:path*',   destination: '/haendler/:path*', permanent: true },
      { source: '/atolye/merkez',     destination: '/bestellung',  permanent: true },
      { source: '/atolye',            destination: '/werkstatt',   permanent: true },
      { source: '/atolye/:path*',     destination: '/werkstatt/:path*', permanent: true },
      { source: '/backend',           destination: '/admin',       permanent: true },
      { source: '/backend/:path*',    destination: '/admin/:path*', permanent: true },

      // /verkauf tamamen kalktı: Vertrieb sipariş girmiyor.
      { source: '/verkauf',           destination: '/bestellung',  permanent: true },
      { source: '/verkauf/:path*',    destination: '/bestellung',  permanent: true },
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
