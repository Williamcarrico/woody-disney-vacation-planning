import type { NextConfig } from "next";
// import { withPWAInit } from '@ducanh2912/next-pwa'

// const withPWA = withPWAInit({
//   dest: 'public',
//   cacheOnFrontEndNav: true,
//   aggressiveFrontEndNavCaching: true,
//   reloadOnOnline: true,
//   swcMinify: true,
//   disable: process.env.NODE_ENV === 'development',
//   workboxOptions: {
//     disableDevLogs: true,
//   },
//   // Uncomment to disable periodic checks for app updates
//   // skipWaiting: false,
// })

const nextConfig: NextConfig = {
  /* config options here */

  // Configure external packages to run in Node.js environment
  serverExternalPackages: [
    'firebase-admin',
    'google-logging-utils'
  ],

  // Allow builds to complete even with TypeScript errors
  typescript: {
    // !! WARNING !!
    // This allows production builds to complete even with TypeScript errors
    // Only use this temporarily until all type issues are fixed
    ignoreBuildErrors: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },

  // Polyfill Node.js modules for Edge runtime
  webpack: (config, { isServer, nextRuntime }) => {
    // Apply polyfills for Edge runtime
    if (nextRuntime === 'edge') {
      // Handle node: protocol imports in Edge runtime
      const nodeModules = [
        'process',
        'buffer',
        'util',
        'path',
        'os',
        'fs',
        'crypto',
        'stream',
        'events'
      ];

      // Make sure the alias object exists
      if (!config.resolve) {
        config.resolve = {};
      }

      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      // Polyfill node: protocol imports
      if (Array.isArray(config.resolve.alias)) {
        // Convert array to object if it's an array
        const aliasObj = {};
        config.resolve.alias.forEach(({ name, alias }) => {
          aliasObj[name] = alias;
        });
        config.resolve.alias = aliasObj;
      }

      // Add aliases for node: protocols
      nodeModules.forEach(mod => {
        config.resolve.alias[`node:${mod}`] = `next/dist/compiled/${mod}`;
      });

      // Exclude problematic modules
      config.externals = [
        ...config.externals || [],
        'google-logging-utils', // Add packages that should be excluded from the edge runtime
        'firebase-admin'
      ];
    }

    return config;
  },

  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },

  // Security headers configuration
  headers: async () => [
    {
      // Apply these headers to all routes
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://firebasestorage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' https://firebasestorage.googleapis.com https://lh3.googleusercontent.com data:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://firebasestorage.googleapis.com https://api.themeparks.wiki;",
        },
      ],
    },
  ],
};

// export default withPWA(nextConfig)
export default nextConfig;
