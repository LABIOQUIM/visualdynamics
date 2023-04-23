import { CloudCog, Code2 } from "lucide-react";
import { useTranslation } from "next-i18next";

import { SEO } from "@app/components/SEO";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";

export const getStaticProps = withSSRTranslations(undefined, {
  namespaces: ["home"]
});

export default function Home() {
  const { t } = useTranslation(["home"]);

  const features = [
    {
      name: "home:features.runs-on-cloud.title",
      description: "home:features.runs-on-cloud.description",
      icon: CloudCog
    },
    {
      name: "home:features.open-source.title",
      description: "home:features.open-source.description",
      icon: Code2
    }
  ];

  return (
    <>
      <SEO
        title={t("home:title")}
        description={t("home:description")}
      />
      <div className="text-center">
        <h2 className="text-base font-semibold leading-7 text-primary-600 transition-all duration-500 dark:text-primary-300">
          {t("home:callout")}
        </h2>
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t("home:slogan")}
        </p>
      </div>
      <p className="text-justify text-lg leading-8 text-gray-600 dark:text-gray-300">
        {t("home:description")}
      </p>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2 lg:gap-y-16">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative pl-12"
          >
            <dt className="flex text-base font-semibold text-gray-900 dark:text-gray-100">
              <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 transition-all duration-500">
                <feature.icon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              {t(feature.name)}
            </dt>
            <dd className="text-base text-gray-600 dark:text-gray-300">
              {t(feature.description)}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
