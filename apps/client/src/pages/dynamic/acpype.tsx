import dynamic from "next/dynamic";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { FullPageLoader } from "@app/components/FullPageLoader";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";

const ACPYPEForm = dynamic(
  () => import("@app/components/Forms/ACPYPE").then((mod) => mod.ACPYPEForm),
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

export default function ACPYPEDynamic({ user }: { user: User }) {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t("navigation:dynamic.models.acpype")} />
      <h2 className="-mb-2.5 text-2xl text-primary-600 dark:text-primary-400">
        {t("navigation:dynamic.models.acpype")}
      </h2>
      <ACPYPEForm user={user} />
    </>
  );
}
