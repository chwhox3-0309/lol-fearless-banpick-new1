/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ddragon.leagueoflegends.com'],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' *.googlesyndication.com *.google.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google.com *.googlesyndication.com *.googleadservices.com *.adtrafficquality.google;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
