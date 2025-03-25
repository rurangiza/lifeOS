import type { NextConfig } from 'next';
import { withContentlayer } from "next-contentlayer";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    viewTransition: true
  },
  webpack: (config, { isServer }) => {
    // Polyfill `process` for the browser; only needed on the client side.
    if (!isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};

module.exports = withContentlayer(nextConfig)
