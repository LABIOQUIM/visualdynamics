/* eslint-disable @typescript-eslint/no-var-requires */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "placekitten.com",
      "avatars.githubusercontent.com",
      "images.unsplash.com"
    ]
  }
};

module.exports = withBundleAnalyzer(nextConfig);
