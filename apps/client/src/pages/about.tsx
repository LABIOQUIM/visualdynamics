import { useTranslation } from "next-i18next";

import { MaintainerCard } from "@app/components/MaintainerCard";
import { SEO } from "@app/components/SEO";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

export const getServerSideProps = withSSRTranslations(undefined, {
  namespaces: ["about"]
});

const maintainers: Maintainer[] = [
  {
    name: "Dr. Fernando Berton Zanchi",
    link: "http://lattes.cnpq.br/0564343474986429",
    image: "/images/maintainers/fernando.jpg",
    active: true,
    work: ["idea", "code", "manuscript"]
  },
  {
    name: "Dr. Rafael Andrade Caceres",
    link: "http://lattes.cnpq.br/2268580664900763",
    image: "/images/maintainers/rafael.jpg",
    active: true,
    work: ["idea", "manuscript"]
  },
  {
    name: "Ivo Henrique Provensi Vieira",
    link: "http://lattes.cnpq.br/5130583751808996",
    image: "/images/maintainers/ivo.jpg",
    active: true,
    work: ["code"]
  },
  {
    name: "Eduardo Buganemi Botelho",
    active: false,
    work: ["code"]
  },
  {
    name: "Thales Junior de Souza Gomes",
    active: false,
    work: ["code"]
  },
  {
    name: "Bruno Lincon de Souza Bordin",
    active: false,
    work: ["code"]
  }
];

export default function About() {
  const { t } = useTranslation(["about"]);

  return (
    <>
      <SEO
        title={t("about:title")}
        description={t("about:description")}
      />
      <p className="text-lg text-justify">{t("about:description")}</p>

      <p className="text-lg font-grotesk text-gray-500 text-center">
        {t("about:acknowledgements")}
      </p>

      <div className="flex flex-col gap-y-3">
        <h3 className="text-xl uppercase font-bold text-primary-950 dark:text-primary-400">
          {t("about:maintainers.title")}
        </h3>

        <div className="flex flex-col gap-y-2">
          <h5 className="text-lg uppercase font-medium text-primary-900 dark:text-primary-300">
            {t("about:maintainers.active")}
          </h5>
          <div className="flex gap-x-2 flex-wrap">
            {maintainers
              .filter((maintainer) => maintainer.active)
              .map((maintainer) => (
                <MaintainerCard
                  key={maintainer.name}
                  maintainer={maintainer}
                />
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <h5 className="text-lg uppercase font-medium text-primary-900 dark:text-primary-300">
            {t("about:maintainers.inactive")}
          </h5>
          <div className="flex gap-x-2 flex-wrap">
            {maintainers
              .filter((maintainer) => !maintainer.active)
              .map((maintainer) => (
                <MaintainerCard
                  key={maintainer.name}
                  maintainer={maintainer}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
