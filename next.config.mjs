/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://82.165.214.184:8080/:path*' // Proxy to Backend
      }
    ]
  }
};

export default nextConfig;
