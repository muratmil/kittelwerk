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
};

export default nextConfig;
