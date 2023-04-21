const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "en-US",
    locales: ["en-US", "pt-BR"],
    localePath: path.resolve("./public/locales"),
    reloadOnPrerender: process.env.NODE_ENV === "development"
  },
  react: { useSuspense: false }
};
