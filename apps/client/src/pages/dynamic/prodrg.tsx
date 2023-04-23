import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { SEO } from "@app/components/SEO";
import { Spinner } from "@app/components/Spinner";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { authOptions } from "@app/pages/api/auth/[...nextauth]";
import { getRunningDynamic } from "@app/queries/useRunningDynamic";

const PRODRGForm = dynamic(
  () => import("@app/components/Forms/PRODRG").then((mod) => mod.PRODRGForm),
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

export default function PRODRGDynamic({ user }: { user: User }) {
  const router = useRouter();
  const { t } = useTranslation(["forms", "navigation"]);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

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
