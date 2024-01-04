import Link from "next/link";

import { H2 } from "@/components/Typography";
import { getI18n } from "@/locales/server";

export async function TypeSelector() {
  const t = await getI18n();

  return (
    <div className="grid h-[20rem] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {(["apo", "acpype", "prodrg"] as const).map((type) => (
        <Link
          className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-primary-400 transition hover:opacity-70 dark:bg-primary-900"
          href={`/new-simulation?type=${type}`}
          key={type}
        >
          <H2 className="text-center">
            {t(`navigation.simulations.models.${type}`)}
          </H2>
        </Link>
      ))}
    </div>
  );
}
