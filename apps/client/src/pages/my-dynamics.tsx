import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowRight, FileDown, Microscope, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { TextButton } from "@app/components/Button/Text";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import { useSignOut } from "@app/hooks/useSignOut";
import {
  GetListDynamicResult,
  getListDynamics,
  useListDynamics
} from "@app/queries/useListDynamics";

const DynamicCard = dynamic(
  () => import("@app/components/Dynamic/Card").then((mod) => mod.DynamicCard),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(
  withSSRAuth(async (_, session) => {
    if (session) {
      const initialData = await getListDynamics(session.user.username);

      return {
        props: {
          initialData
        }
      };
    }

    return {
      props: {}
    };
  }),
  {
    namespaces: ["my-dynamics"]
  }
);

export default function MyDynamics({
  initialData,
  user
}: {
  user: User;
  initialData: GetListDynamicResult;
}) {
  useSignOut();
  const { data, refetch, isRefetching, isLoading } = useListDynamics(
    user.username,
    {
      initialData,
      refetchOnMount: true
    }
  );
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(60);
  const { t } = useTranslation(["my-dynamics"]);
  const router = useRouter();

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
        <div className="flex flex-col gap-3 md:flex-row">
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
            <p className="my-auto ml-2 md:ml-auto">
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
      <div className="mx-auto flex flex-1 flex-col justify-center lg:w-1/2">
        <Microscope className="stoke-primary-950 mx-auto mb-2 h-14 w-14 dark:stroke-primary-400" />
        <h1 className="text-center text-2xl font-bold uppercase text-primary-950 dark:text-primary-400">
          {t("my-dynamics:empty.title")}
        </h1>
        <p className="text-center">{t("my-dynamics:empty.description")}</p>

        <div className="mx-auto mt-5 flex flex-wrap gap-x-2">
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
