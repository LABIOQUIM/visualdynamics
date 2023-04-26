import dynamic from "next/dynamic";
import { User } from "next-auth";
import { useTranslation } from "next-i18next";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";

const APOForm = dynamic(
  () => import("@app/components/Forms/APO").then((mod) => mod.APOForm),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(
  withSSRAuth(async (_, session) => {
    if (session) {
      const data = await getRunningDynamic(session.user.username);

      if (data?.status === "running") {
        return {
          redirect: {
            destination: "/dynamic/running",
            permanent: false
          }
        };
      }
    }

    return {
      props: {}
    };
  }),
  {
    namespaces: ["forms"]
  }
);

export default function APODynamic({ user }: { user: User }) {
  const { t } = useTranslation(["navigation"]);

  return (
    <>
      <SEO title={t("navigation:dynamic.models.apo")} />
      <h2 className="text-center text-2xl text-primary-700 dark:text-primary-400">
        {t("navigation:dynamic.models.apo")}
      </h2>
      <APOForm user={user} />
    </>
  );
}
