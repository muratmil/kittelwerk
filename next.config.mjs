// kittelwerk.de YALNIZCA dükkân.
//
// Yönetim adresleri (/admin, /monitor, /bestellung, /werkstatt, /haendler,
// /is-takip, /login) ve dört panelli eski dünyadan kalanlar (/backend,
// /reseller, /atolye, /verkauf) burada BİLEREK yok — yönlendirme bile yok,
// 404 dönüyorlar. Murat'ın kararı: yönetim yalnız gastrocollect.de'de.
//
// Yönlendirme bırakmak, dükkânın adresinden yönetimin nerede olduğunu
// söylemek demekti. Bedeli: bu adreslere ait eski yer imleri ve arama motoru
// kayıtları artık 404 alıyor — kabul edildi.
//
// Buraya yönetim adresi EKLEME. Bayi kaydına giden bağlantı dükkânın
// footer'ında ve doğrudan gastrocollect.de'yi gösteriyor.

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
