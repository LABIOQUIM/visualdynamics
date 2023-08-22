import { createI18nServer } from "next-international/server";

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } =
  createI18nServer({
    "en-US": () => import("./en-US"),
    "pt-BR": () => import("./pt-BR")
  });
