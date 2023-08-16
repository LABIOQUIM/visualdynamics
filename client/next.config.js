/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true
  },
  images: {
    domains: [
      "placekitten.com",
      "avatars.githubusercontent.com",
      "images.unsplash.com"
    ]
  }
};

module.exports = withBundleAnalyzer(nextConfig);
