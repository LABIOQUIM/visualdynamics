import { createI18nServer } from "next-international/server";

export const { getI18n } = createI18nServer({
  "en-US": () => import("./en-US"),
  "pt-BR": () => import("./pt-BR")
});
