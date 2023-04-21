import { Code2, Lightbulb, Newspaper } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import { BlurImage } from "../BlurImage";

interface MaintainerCardProps {
  maintainer: Maintainer;
}

export function MaintainerCard({ maintainer }: MaintainerCardProps) {
  const { t } = useTranslation(["about"]);

  const WorkIcon = {
    idea: Lightbulb,
    code: Code2,
    manuscript: Newspaper
  };

  const WorkTitle = {
    idea: "about:work.idea",
    code: "about:work.code",
    manuscript: "about:work.manuscript"
  };

  return (
    <Link
      href={maintainer.link ?? "#"}
      target={
        maintainer.link && maintainer.link.startsWith("http")
          ? "_blank"
          : undefined
      }
      className="group p-2 flex gap-x-2 items-center rounded-md hover:bg-zinc-800/20 transition-all duration-500"
      key={maintainer.name}
    >
      {maintainer.image ? (
        <BlurImage
          alt={maintainer.name}
          className="h-14 w-14 rounded-full"
          height={0}
          width={0}
          src={maintainer.image}
          unoptimized
        />
      ) : null}
      <div>
        <p className="transition-all duration-500 text-primary-800 group-hover:text-primary-700">
          {maintainer.name}
        </p>
        <div className="flex gap-1 flex-wrap">
          {maintainer.work && maintainer.work.length > 0
            ? maintainer.work.map((w) => {
                const Icon = WorkIcon[w];

                return (
                  <p
                    key={maintainer.name + w}
                    title={t(WorkTitle[w])}
                  >
                    <Icon className="stroke-primary-600 stroke-[1] h-5 w-5" />
                  </p>
                );
              })
            : null}
        </div>
      </div>
    </Link>
  );
}
