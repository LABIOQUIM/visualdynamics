/* eslint-disable @typescript-eslint/no-var-requires */
const { withContentlayer } = require("next-contentlayer");
const { i18n } = require("./next-i18next.config");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  i18n,
  images: {
    domains: [
      "placekitten.com",
      "avatars.githubusercontent.com",
      "images.unsplash.com"
    ]
  }
});

module.exports = withContentlayer(nextConfig);
