/** @type {import('next').NextConfig} */

const nextConfig = {};

module.exports = {
    async rewrites() {
        return [
            {
                source: '/api',
                destination: 'http://82.165.214.184:8080:8000/' // Proxy to Backend
            }
        ]
    }
}

export default nextConfig;
