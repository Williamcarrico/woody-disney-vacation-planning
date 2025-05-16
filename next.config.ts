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

  // Polyfill Node.js modules for Edge runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({
          name: 'node:process',
          alias: 'next/dist/compiled/process'
        });
      } else {
        config.resolve.alias['node:process'] = 'next/dist/compiled/process';
      }
    }
    return config;
  },

  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: true,
  },
};

// export default withPWA(nextConfig)
export default nextConfig;
