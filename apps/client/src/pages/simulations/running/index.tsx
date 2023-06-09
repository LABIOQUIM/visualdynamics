import { ArrowRight, FileCog } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/general/buttons";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { Paragraph } from "@app/components/general/typography/paragraphs";
import { SEO } from "@app/components/SEO";
import { SimulationAbortButton } from "@app/components/simulations/running/abort-button";
import { withSSRAuth } from "@app/hocs/withSSRAuth";
import { useUserRunningSimulation } from "@app/queries/useUserRunningSimulation";

const RealtimeLog = dynamic(
  () =>
    import("@app/components/simulations/running/realtime-log").then(
      (mod) => mod.SimulationRealtimeLog
    ),
  {
    ssr: false
  }
);

const StepList = dynamic(
  () =>
    import("@app/components/simulations/running/step-list").then(
      (mod) => mod.SimulationStepList
    ),
  {
    ssr: false
  }
);

export const getServerSideProps = withSSRAuth();

export default function Running({ user }: { user: User }) {
  const { data, isRefetching } = useUserRunningSimulation(user.username, {
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
      <PageLayout>
        <SEO title={t("running:title")} />
        <div className="relative">
          <div className="absolute right-0 top-1">
            <SimulationAbortButton
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
        <StepList activeSteps={data.steps} />
        <RealtimeLog
          isRefetching={isRefetching}
          logLines={data.log}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
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
    </PageLayout>
  );
}
