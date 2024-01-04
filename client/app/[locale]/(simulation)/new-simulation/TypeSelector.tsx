import Link from "next/link";

import { H2 } from "@/components/Typography";
import { getI18n } from "@/locales/server";
import { cnMerge } from "@/utils/cnMerge";

type Props = {
  scale?: "small" | "normal";
};

export async function TypeSelector({ scale = "normal" }: Props) {
  const t = await getI18n();

  return (
    <div
      className={cnMerge(
        "grid h-[20rem] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3",
        {
          "h-20": scale === "small"
        }
      )}
    >
      {(["apo", "acpype", "prodrg"] as const).map((type) => (
        <Link
          className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-primary-400 px-6 transition hover:opacity-70 dark:bg-primary-900"
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
