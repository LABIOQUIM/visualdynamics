/* eslint-disable @typescript-eslint/no-var-requires */
const { withContentlayer } = require("next-contentlayer");
const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: ["placekitten.com", "avatars.githubusercontent.com"]
  }
};

module.exports = withContentlayer(nextConfig);
