import { Github, ScrollText } from "lucide-react";
import NextLink from "next/link";
import useTranslation from "next-translate/useTranslation";

import pkg from "../../../../package.json";

export function Footer() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-300 pt-2 text-zinc-700 dark:border-neutral-800 dark:text-zinc-400 md:mt-2 md:flex-row">
      <span>v{pkg.version}</span>
      <nav className="grid grid-flow-row grid-cols-1 gap-3 md:grid-cols-3">
        <NextLink
          className="inline-flex gap-x-1 hover:text-zinc-900 dark:hover:text-zinc-100"
          href="https://github.com/LABIOQUIM/visualdynamics/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ScrollText className="my-auto h-3.5 w-3.5" />
          {t("navigation:footer.release-notes")}
        </NextLink>
        <NextLink
          className="inline-flex gap-x-1 hover:text-zinc-900 dark:hover:text-zinc-100"
          href="https://github.com/LABIOQUIM/visualdynamics"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="my-auto h-3.5 w-3.5" />
          Open Source
        </NextLink>
      </nav>
    </div>
  );
}
