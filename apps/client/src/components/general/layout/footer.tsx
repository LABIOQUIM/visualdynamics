import { Github, ScrollText } from "lucide-react";
import NextLink from "next/link";
import useTranslation from "next-translate/useTranslation";

import pkg from "../../../../package.json";

export function Footer() {
  const { t } = useTranslation();

  return (
    <nav className="space-x-5 text-zinc-700 dark:text-zinc-400">
      <span>v{pkg.version}</span>
      <NextLink
        className="inline-flex gap-x-1 hover:text-zinc-900 dark:hover:text-zinc-100"
        href="https://github.com/LABIOQUIM/visualdynamics/releases/latest"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ScrollText className="m-auto h-3.5 w-3.5" />
        {t("navigation:footer.release-notes")}
      </NextLink>
      <NextLink
        className="inline-flex gap-x-1 hover:text-zinc-900 dark:hover:text-zinc-100"
        href="https://github.com/LABIOQUIM/visualdynamics"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github className="m-auto h-3.5 w-3.5" />
        Open Source
      </NextLink>
    </nav>
  );
}
