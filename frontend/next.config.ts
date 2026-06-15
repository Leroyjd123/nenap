import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @nenap/types ships TS source consumed via the workspace build output.
  transpilePackages: ['@nenap/types'],
};

export default nextConfig;
