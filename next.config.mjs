/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination:
          'https://jeffreykayzerman.com/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
