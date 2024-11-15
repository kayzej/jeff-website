/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          'https://jeffreykayzerman.com/api/:path*', // Proxy to api
      },
    ];
  },
};

export default nextConfig;
