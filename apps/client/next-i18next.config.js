module.exports = {
  i18n: {
    defaultLocale: "en-US",
    locales: ["en-US", "pt-BR"],
    reloadOnPrerender: process.env.NODE_ENV === "development"
  },
  react: { useSuspense: false }
};
