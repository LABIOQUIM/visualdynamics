import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getServerSession, User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";

const ACPYPEForm = dynamic(
  () => import("@app/components/Forms/ACPYPE").then((mod) => mod.ACPYPEForm),
  {
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    ),
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(
  withSSRAuth(async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
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

export default function ACPYPEDynamic({ user }: { user: User }) {
  const router = useRouter();
  const { t } = useTranslation(["navigation"]);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  return (
    <>
      <SEO title={t("navigation:dynamic.models.acpype")} />
      <h2 className="text-center text-2xl -mb-2.5 text-primary-600 dark:text-primary-400">
        {t("navigation:dynamic.models.acpype")}
      </h2>
      <ACPYPEForm user={user} />
    </>
  );
}
