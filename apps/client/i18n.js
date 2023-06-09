module.exports = {
  locales: ["en-US", "pt-BR"],
  defaultLocale: "en-US",
  pages: {
    "*": ["common", "navigation"],
    "/": ["home"],
    "/about": ["about"],
    "/account/signin": ["signin"],
    "/account/signup": ["signup"],
    "rgx:^/account/recover.*": ["reset-password"],
    "/admin/signup": ["admin-signup"],
    "/admin/running": ["admin-running"],
    "/admin/md-pr/update": ["admin-mdpr-update"],
    "/simulations": ["my-dynamics"],
    "/simulations/running": ["running"],
    "rgx:^/simulations/new/[A-Za-z]+": ["forms"]
  }
};
