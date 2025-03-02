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
    // Ignore ESLint errors during build
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    // Suppress the punycode deprecation warning
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                punycode: false,
            };
        }
        return config;
    },
}

module.exports = nextConfig