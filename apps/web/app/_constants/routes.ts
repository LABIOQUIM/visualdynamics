export const RouteLinks = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ANALYTICS: "/analytics",
  GUIDES: "/guides",
  EMAIL_VALIDATION: "/account/email-validation",
  PASSWORD_RESET: "/account/password-reset",
  SIMULATIONS: "/app",
  SIMULATIONS_ABOUT: "/app/simulations/about",
  SIMULATIONS_APO: "/app/simulations/new/apo",
  SIMULATIONS_ACPYPE: "/app/simulations/new/acpype",
  SIMULATIONS_RUNNING: "/app/simulations",

  ADMIN_DASHBOARD: "/app/admin",
  ADMIN_USERS: "/app/admin/users",
  ADMIN_SIMULATIONS: "/app/admin/simulations",
  ADMIN_STATUS: "/app/admin/status",
  ADMIN_SETTINGS: "/app/admin/settings",

  PLASMO_QSAR: "https://www.qsar.labioquim.fiocruz.br/",
  PLASMO_IA: "https://www.plasmoia.labioquim.fiocruz.br/",
} as const;
