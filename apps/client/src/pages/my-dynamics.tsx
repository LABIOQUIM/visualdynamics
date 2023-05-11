import { useEffect, useState } from "react";
import { ArrowRight, FileDown, Microscope, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/Button";
import { TextButton } from "@app/components/Button/Text";
import { DynamicCard } from "@app/components/Dynamic/Card";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import {
  GetListDynamicResult,
  getListDynamics,
  useListDynamics
} from "@app/queries/useListDynamics";
import { cnMerge } from "@app/utils/cnMerge";

export const getServerSideProps = withSSRAuth(async (_, session) => {
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
});

export default function MyDynamics({
  initialData,
  user
}: {
  user: User;
  initialData: GetListDynamicResult;
}) {
  const { data, refetch, isRefetching, isLoading } = useListDynamics(
    user.username,
    {
      initialData,
      refetchOnMount: true
    }
  );
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(60);
  const { t } = useTranslation();
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
              iconClassName={cnMerge({
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
