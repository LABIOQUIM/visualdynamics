/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://localhost:3000",
  generateRobotsTxt: true // (optional)
  // ...other options
};
