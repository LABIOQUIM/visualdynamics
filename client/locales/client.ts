import { createI18nClient } from "next-international/client";

export const { useI18n, useScopedI18n, I18nProviderClient, useCurrentLocale } =
  createI18nClient({
    "en-US": () => import("./en-US"),
    "pt-BR": () => import("./pt-BR")
  });
