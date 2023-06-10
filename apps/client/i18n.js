module.exports = {
  locales: ["en-US", "pt-BR"],
  defaultLocale: "en-US",
  pages: {
    "*": ["common", "navigation"],

    // Misc
    "/": ["home"],
    "/about": ["about"],

    // Account
    "/account/login": ["account-login"],
    "/account/register": ["account-register"],
    "rgx:^/account/recover.*": ["account-recover"],

    // Admin
    "/admin/user-validation": ["admin-user-validation"],
    "/admin/running": ["admin-running"],
    "/admin/md-config": ["admin-mdpr-update"],

    // Simulations
    "/simulations": ["simulations"],
    "/simulations/running": ["simulations-running"],
    "rgx:^/simulations/new/[A-Za-z]+": ["simulations-form"]
  }
};
