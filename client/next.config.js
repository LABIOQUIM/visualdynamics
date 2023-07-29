/* eslint-disable @typescript-eslint/no-var-requires */
const { withContentlayer } = require("next-contentlayer");
const nextTranslate = require("next-translate-plugin");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = withBundleAnalyzer(
  withContentlayer(nextTranslate(nextConfig))
);
