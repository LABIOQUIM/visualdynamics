import { ArrowRight, FileCog } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/Button";
import { DynamicRunningAbortButton } from "@app/components/Dynamic/Running/AbortButton";
import { SEO } from "@app/components/SEO";
import { H1 } from "@app/components/Typography/Headings";
import { Paragraph } from "@app/components/Typography/Paragraphs";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import {
  getRunningDynamic,
  GetRunningDynamicResult,
  useRunningDynamic
} from "@app/queries/useRunningDynamic";

const DynamicRunningRealtimeLog = dynamic(
  () =>
    import("@app/components/Dynamic/Running/RealtimeLog").then(
      (mod) => mod.DynamicRunningRealtimeLog
    ),
  {
    ssr: false
  }
);

const DynamicRunningStepList = dynamic(
  () =>
    import("@app/components/Dynamic/Running/StepList").then(
      (mod) => mod.DynamicRunningStepList
    ),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth(async (_, session) => {
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
});

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
  const { t } = useTranslation();
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
          <h4 className="font-bold uppercase text-primary-950 dark:text-primary-300">
            {t("running:description")}
          </h4>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:taskId")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
              {data.info.celeryId}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:type")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
              {data.info.type}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:molecule")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
              {data.info.molecule}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("running:createdAt")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
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
      <div className="m-auto flex w-1/2 flex-col justify-center text-center">
        <FileCog className="mx-auto mb-2 h-14 w-14 stroke-primary-600 dark:stroke-primary-400" />
        <H1 className="uppercase">{t("running:not-running.title")}</H1>
        <Paragraph>{t("running:not-running.description")}</Paragraph>

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
          <Link href="/dynamic/prodrg">
            <Button RightIcon={ArrowRight}>
              {t("navigation:dynamic.models.prodrg")}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
