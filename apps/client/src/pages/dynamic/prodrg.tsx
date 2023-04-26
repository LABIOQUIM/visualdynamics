import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { User } from "next-auth";
import { useTranslation } from "next-i18next";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";

const PRODRGForm = dynamic(
  () => import("@app/components/Forms/PRODRG").then((mod) => mod.PRODRGForm),
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

export default function PRODRGDynamic({ user }: { user: User }) {
  const { t } = useTranslation(["forms", "navigation"]);

  return (
    <>
      <SEO title={t("navigation:dynamic.models.prodrg")} />
      <h2 className="-mb-2.5 text-center text-2xl text-primary-600 dark:text-primary-400">
        {t("navigation:dynamic.models.prodrg")}
      </h2>
      <div className="mb-2 flex gap-x-2 rounded-md border border-yellow-600 bg-yellow-400/20 p-2 text-yellow-950 dark:text-yellow-200">
        <AlertTriangle className="my-auto h-10 w-10 stroke-yellow-950 dark:stroke-yellow-200" />
        {t("navigation:dynamic.models.prodrg-disabled")}
      </div>
      <PRODRGForm user={user} />
    </>
  );
}
