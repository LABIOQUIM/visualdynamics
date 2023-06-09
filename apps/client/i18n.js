module.exports = {
  locales: ["en-US", "pt-BR"],
  defaultLocale: "en-US",
  pages: {
    "*": ["common", "navigation"],

    // Misc
    "/": ["home"],
    "/about": ["about"],

    // Account
    "/account/signin": ["account-signin"],
    "/account/signup": ["account-signup"],
    "rgx:^/account/recover.*": ["account-recover"],

    // Admin
    "/admin/signup": ["admin-signup"],
    "/admin/running": ["admin-running"],
    "/admin/md-pr/update": ["admin-mdpr-update"],

    // Simulations
    "/simulations": ["simulations"],
    "/simulations/running": ["simulations-running"],
    "rgx:^/simulations/new/[A-Za-z]+": ["simulations-form"]
  }
};
