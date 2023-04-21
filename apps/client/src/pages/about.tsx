import { Code, Lightbulb, Newspaper } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

import { BlurImage } from "@app/components/BlurImage";
import { PageLayout } from "@app/components/Layout/Page";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

export const getServerSideProps = withSSRTranslations(undefined, {
  namespaces: ["about"]
});

interface Maintainer {
  name: string;
  link?: string;
  active: boolean;
  image?: string;
  work?: ("idea" | "code" | "manuscript")[];
}
const WorkIcon = {
  idea: Lightbulb,
  code: Code,
  manuscript: Newspaper
};

const maintainers: Maintainer[] = [
  {
    name: "Dr. Fernando Berton Zanchi",
    active: true,
    work: ["idea", "code", "manuscript"]
  },
  {
    name: "Dr. Rafael Andrade Caceres",
    active: true,
    work: ["idea", "manuscript"]
  },
  {
    name: "Ivo Henrique Provensi Vieira",
    link: "https://github.com/ivopr",
    image: "https://avatars.githubusercontent.com/u/30270448?v=4",
    active: true,
    work: ["code"]
  },
  {
    name: "Eduardo Buganemi Botelho",
    active: false
  },
  {
    name: " Thales Junior de Souza Gomes",
    active: false
  },
  {
    name: "Bruno Lincon de Souza Bordin",
    active: false
  }
];

export default function About() {
  const { t } = useTranslation(["about"]);

  return (
    <PageLayout
      title={t("about:title")}
      description={t("about:description")}
    >
      <p className="text-lg text-zinc-700 text-justify">
        {t("about:description")}
      </p>

      <p className="text-lg font-grotesk text-zinc-700 text-center">
        {t("about:acknowledgements")}
      </p>

      <h3 className="text-xl uppercase font-bold text-primary-950">
        {t("about:maintainers.title")}
      </h3>
      <h5 className="text-lg uppercase font-medium text-primary-900">
        {t("about:maintainers.active")}
      </h5>
      <div className="flex gap-x-2 flex-wrap">
        {maintainers
          .filter((maintainer) => maintainer.active)
          .map((maintainer) => (
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
                          <Icon
                            className="h-5 w-5"
                            key={maintainer.name + w}
                          />
                        );
                      })
                    : null}
                </div>
              </div>
            </Link>
          ))}
      </div>

      <h5 className="text-lg uppercase font-medium text-primary-900">
        {t("about:maintainers.inactive")}
      </h5>
      {maintainers
        .filter((maintainer) => !maintainer.active)
        .map((maintainer) => (
          <div
            className="group p-2 rounded-md hover:bg-zinc-800/20 transition-all duration-500"
            key={maintainer.name}
          >
            <p>{maintainer.name}</p>
          </div>
        ))}
    </PageLayout>
  );
}
