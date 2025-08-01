import type {NextConfig} from 'next';
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  }
};

if (process.env.NODE_ENV === 'development') {
   await setupDevPlatform();
 }

export default nextConfig;
