import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowRight, FileDown, Microscope, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { TextButton } from "@app/components/Button/Text";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { useListDynamics } from "@app/queries/useListDynamics";

const DynamicCard = dynamic(
  () => import("@app/components/DynamicCard").then((mod) => mod.DynamicCard),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(withSSRAuth(), {
  namespaces: ["my-dynamics"]
});

export default function MyDynamics({ user }: { user: User }) {
  const { data, refetch, isRefetching, isLoading } = useListDynamics(
    user.username,
    {
      refetchOnMount: true
    }
  );
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(60);
  const { t } = useTranslation(["my-dynamics"]);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefetching) {
        setTimeUntilRefresh((currentTime) => currentTime - 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRefetching]);

  useEffect(() => {
    if (isRefetching) {
      setTimeUntilRefresh(60);
    }

    if (timeUntilRefresh <= 0) {
      refetch();
    }
  }, [isRefetching, refetch, timeUntilRefresh]);

  if (data?.status === "listed") {
    return (
      <>
        <SEO title={t("my-dynamics:title")} />
        <div className="flex flex-col md:flex-row gap-3">
          <Button
            LeftIcon={FileDown}
            onClick={() => router.push("/api/downloads/mdp")}
          >
            {t("my-dynamics:downloads.mdp")}
          </Button>
          <div className="flex flex-1">
            <TextButton
              iconClassName={clsx({
                "animate-spin": isRefetching || isLoading
              })}
              disabled={isRefetching || isLoading}
              LeftIcon={RefreshCw}
              onClick={() => refetch()}
            />
            <p className="ml-2 md:ml-auto my-auto">
              {t("my-dynamics:auto-refresh", { seconds: timeUntilRefresh })}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          {data.dynamics.map((dynamic) => (
            <DynamicCard
              dynamic={dynamic}
              key={dynamic.celeryId}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={t("my-dynamics:title")} />
      <div className="flex flex-col justify-center py-10 lg:w-1/2 mx-auto">
        <Microscope className="stoke-primary-950 dark:stroke-primary-400 h-14 w-14 mx-auto mb-2" />
        <h1 className="text-primary-950 dark:text-primary-400 uppercase text-center font-bold text-2xl">
          {t("my-dynamics:empty.title")}
        </h1>
        <p className="text-center">{t("my-dynamics:empty.description")}</p>

        <div className="flex gap-x-2 flex-wrap mt-5 mx-auto">
          <Link href="/dynamic/apo">
            <Button RightIcon={ArrowRight}>
              {t("navigation:dynamic.models.apo")}
            </Button>
          </Link>
          <Link href="/dynamic/acpype">
            <Button RightIcon={ArrowRight}>
              {t("navigation:dynamic.models.acpype")}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
