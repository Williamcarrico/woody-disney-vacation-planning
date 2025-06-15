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

  // TypeScript configuration - ignore build errors for now
  typescript: {
    // Temporarily ignore build errors during optimization
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration - ignore during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },

  // Polyfill Node.js modules for Edge runtime and configure Socket.io
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
        const aliasObj: Record<string, string> = {};
        config.resolve.alias.forEach(({ name, alias }: { name: string; alias: string }) => {
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

    // Configure Socket.io and Three.js for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Three.js specific optimizations
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // Optimize Three.js bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },

  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
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
        // CSP is handled in middleware.ts for more comprehensive control
      ],
    },
  ],
};

// export default withPWA(nextConfig)
export default nextConfig;
