/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Add performance optimizations
    poweredByHeader: false,
    compress: true,
    // Optimize image handling
    images: {
        domains: [],
        formats: ['image/avif', 'image/webp'],
    },
    // Experimental features for better performance
    experimental: {
        optimizeCss: true,
        scrollRestoration: true,
    },
}

module.exports = nextConfig