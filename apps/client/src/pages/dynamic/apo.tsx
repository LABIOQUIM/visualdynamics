import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";

const APOForm = dynamic(
  () => import("@app/components/Forms/APO").then((mod) => mod.APOForm),
  {
    loading: () => <FullPageLoader />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth(async (_, session) => {
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
});

export default function APODynamic({ user }: { user: User }) {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("navigation:dynamic.models.apo")} />
      <h2 className="text-2xl text-primary-700 dark:text-primary-400">
        {t("navigation:dynamic.models.apo")}
      </h2>
      <APOForm user={user} />
    </>
  );
}
