import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow up to 55 MB through middleware (zip + screenshots)
  experimental: {
    middlewareClientMaxBodySize: 55 * 1024 * 1024,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
