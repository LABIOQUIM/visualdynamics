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
    "/admin/active-simulations": ["admin-active-simulations"],
    "/admin/settings": ["admin-md-config"],

    // Simulations
    "/simulations": ["simulations"],
    "/simulations/running": ["simulations-running"],
    "rgx:^/simulations/new/[A-Za-z]+": ["simulations-form"]
  }
};
