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
    'google-logging-utils',
    'ioredis' // Add Redis client
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
    },
    // Enable optimizations
    optimizeCss: true,
    scrollRestoration: true
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    // Enable emotion support if needed
    emotion: true
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  // Optimize build output
  output: 'standalone',
  
  // Module transpilation for older packages
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'lottie-react'
  ],

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

    // Enhanced bundle splitting for optimal performance
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: false,
            default: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|next)[\\/]/,
              priority: 40,
              chunks: 'all'
            },
            lib: {
              test(module: any) {
                return module.size() > 160000 &&
                  /node_modules[\\/]/.test(module.identifier())
              },
              name(module: any) {
                const hash = require('crypto').createHash('sha1')
                hash.update(module.identifier())
                return `lib-${hash.digest('hex').substring(0, 8)}`
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true
            },
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true
            },
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15
            },
            maps: {
              test: /[\\/]node_modules[\\/](@vis\.gl|mapbox-gl)[\\/]/,
              name: 'maps',
              chunks: 'all',
              priority: 15
            },
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3|victory)[\\/]/,
              name: 'charts',
              chunks: 'async',
              priority: 10
            },
            lodash: {
              test: /[\\/]node_modules[\\/]lodash[\\/]/,
              name: 'lodash',
              chunks: 'all',
              priority: 10
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        },
        minimize: true,
        runtimeChunk: {
          name: 'runtime'
        },
        moduleIds: 'deterministic'
      };
    }

    return config;
  },

  reactStrictMode: true,
  images: {
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      }
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
