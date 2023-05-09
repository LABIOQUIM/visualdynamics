module.exports = {
  locales: ["en-US", "pt-BR"],
  defaultLocale: "en-US",
  pages: {
    "*": ["common", "navigation"],
    "/": ["home"],
    "/my-dynamics": ["my-dynamics"],
    "/about": ["about"],
    "/signin": ["signin"],
    "/signup": ["signup"],
    "/admin/signup": ["admin-signup"],
    "/admin/running": ["admin-running"],
    "/admin/md-pr/update": ["admin-mdpr-update"],
    "/dynamic/running": ["running"],
    "rgx:^/dynamic/[A-Za-z]+": ["forms"],
    "/reset-password": ["reset-password"],
    "/reset-password/[resetId]": ["reset-password"]
  }
};
