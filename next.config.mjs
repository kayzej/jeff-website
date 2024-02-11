/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          'http://82.165.214.184:8080/jeff-website-api-0.0.1-SNAPSHOT/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
