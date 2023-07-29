import { ExternalLink } from "lucide-react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import { MaintainerCard } from "@app/components/about/maintainer-card";
import { BlurImage } from "@app/components/general/blur-image";
import { PageLayout } from "@app/components/general/page-layout";
import { H1, H2 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";

import logo from "../../../public/images/favicon.svg";

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
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("about:title")}
        description={t("about:description")}
      />
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <BlurImage
            alt=""
            className="p-0.5"
            src={logo}
          />
          <p className="text-justify text-lg">{t("about:description")}</p>
        </div>
        <p className="text-center  text-lg text-gray-500">
          {t("about:acknowledgements")}
        </p>

        <div>
          <H1>{t("about:publication.title")}</H1>

          <ul className="list-[upper-roman] leading-relaxed">
            <li>
              Visual dynamics: a WEB application for molecular dynamics
              simulation using GROMACS. BMC Bioinformatics 24, 107 (2023).
              <Link
                className="inline-block underline underline-offset-4 hover:opacity-75"
                href="https://doi.org/10.1186/s12859-023-05234-y"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://doi.org/10.1186/s12859-023-05234-y
                <ExternalLink className="ml-0.5 inline-block h-4 w-4" />
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-3">
          <H1>{t("about:maintainers.title")}</H1>

          <div className="flex flex-col gap-y-2">
            <H2>{t("about:maintainers.active")}</H2>
            <div className="grid grid-flow-row grid-cols-2 gap-2 lg:grid-cols-3">
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
            <H2>{t("about:maintainers.inactive")}</H2>
            <div className="grid grid-flow-row grid-cols-2 gap-2 lg:grid-cols-3">
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
      </div>
    </PageLayout>
  );
}
