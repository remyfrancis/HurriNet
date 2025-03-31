/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Disable the error overlay
  onError: () => {},
  async rewrites() {
    return [
      {
        source: '/api/:path*/',
        destination: 'http://127.0.0.1:8000/api/:path*/'
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*/'
      }
    ]
  }
}

module.exports = nextConfig 