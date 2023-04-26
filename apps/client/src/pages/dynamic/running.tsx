import { ArrowRight, FileCog } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { DynamicRunningAbortButton } from "@app/components/DynamicRunningAbortButton";
import { SEO } from "@app/components/SEO";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { withSSRTranslations } from "@app/hocs/withSSRTranslations";
import {
  getRunningDynamic,
  GetRunningDynamicResult,
  useRunningDynamic
} from "@app/queries/useRunningDynamic";

const DynamicRunningRealtimeLog = dynamic(
  () =>
    import("@app/components/DynamicRunningRealtimeLog").then(
      (mod) => mod.DynamicRunningRealtimeLog
    ),
  {
    ssr: false
  }
);

const DynamicRunningStepList = dynamic(
  () =>
    import("@app/components/DynamicRunningStepList").then(
      (mod) => mod.DynamicRunningStepList
    ),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRTranslations(
  withSSRAuth(async (_, session) => {
    if (session) {
      const initialData = await getRunningDynamic(session.user.username);

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
    namespaces: ["running"]
  }
);

export default function Running({
  initialData,
  user
}: {
  user: User;
  initialData: GetRunningDynamicResult;
}) {
  const { data, isRefetching } = useRunningDynamic(user.username, {
    initialData,
    refetchOnMount: true
  });
  const { t } = useTranslation(["navigation", "running"]);
  const router = useRouter();

  if (data?.status === "running") {
    const disableAbortButton =
      data.steps[data.steps.length - 1] === "topology" ||
      data.steps[data.steps.length - 1] === "solvate" ||
      data.steps[data.steps.length - 1] === "ions";

    return (
      <>
        <SEO title={t("running:title")} />
        <div className="relative">
          <div className="absolute right-0 top-1">
            <DynamicRunningAbortButton
              folder={data.info.folder}
              celeryId={data.info.celeryId}
              disableAbortButton={disableAbortButton}
            />
          </div>
          <h4 className="font-bold uppercase text-primary-950">
            {t("running:description")}
          </h4>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:taskId")}:</p>
            <p className="font-bold text-primary-950">{data.info.celeryId}</p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:type")}:</p>
            <p className="font-bold text-primary-950">{data.info.type}</p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:molecule")}:</p>
            <p className="font-bold text-primary-950">{data.info.molecule}</p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:createdAt")}:</p>
            <p className="font-bold text-primary-950">
              {Intl.DateTimeFormat(router.locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              }).format(new Date(data.info.timestamp))}
            </p>
          </div>
        </div>
        <DynamicRunningStepList activeSteps={data.steps} />
        <DynamicRunningRealtimeLog
          isRefetching={isRefetching}
          logLines={data.log}
        />
      </>
    );
  }

  return (
    <>
      <SEO title={t("running:not-running.title")} />
      <div className="mx-auto flex w-1/2 flex-col justify-center">
        <FileCog className="stoke-primary-950 mx-auto mb-2 h-14 w-14" />
        <h1 className="text-center text-2xl font-bold uppercase text-primary-950">
          {t("running:not-running.title")}
        </h1>
        <p className="text-center">{t("running:not-running.description")}</p>

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
