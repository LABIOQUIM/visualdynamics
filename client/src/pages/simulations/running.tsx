import { ArrowRight, FileCog } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "next-auth";
import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "@app/components/general/alert-box";
import { Button } from "@app/components/general/buttons";
import { PageLayout } from "@app/components/general/page-layout";
import { H1 } from "@app/components/general/typography/headings";
import { Paragraph } from "@app/components/general/typography/paragraphs";
import { SEO } from "@app/components/seo";
import { SimulationAbortButton } from "@app/components/simulations/running/abort-button";
import { useUserRunningSimulation } from "@app/components/simulations/running/useUserRunningSimulation";
import { withSSRAuth } from "@app/hocs/withSSRAuth";

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
        <SEO title={t("simulations-running:title")} />
        <AlertBox>{t("common:limitations")}</AlertBox>
        <div className="relative">
          <div className="absolute right-0 top-1">
            <SimulationAbortButton
              folder={data.info.folder}
              celeryId={data.info.celeryId}
              disableAbortButton={disableAbortButton}
            />
          </div>
          <h4 className="font-bold uppercase text-primary-950 dark:text-primary-300">
            {t("simulations-running:description")}
          </h4>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("simulations-running:type")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
              {data.info.type}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("simulations-running:molecule")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
              {data.info.molecule}
            </p>
          </div>
          <div className="flex gap-x-2">
            <p className="font-medium">{t("simulations-running:createdAt")}:</p>
            <p className="font-bold text-primary-950 dark:text-primary-300">
              {Intl.DateTimeFormat(router.locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZoneName: "short"
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

  if (data?.status === "queued") {
    return (
      <PageLayout>
        <SEO title={t("simulations-running:queued.title")} />
        <div className="m-auto flex w-1/2 flex-1 flex-col items-center justify-center text-center">
          <FileCog className="mx-auto mb-2 h-14 w-14 stroke-primary-600 dark:stroke-primary-400" />
          <H1 className="uppercase">{t("simulations-running:queued.title")}</H1>
          <Paragraph>{t("simulations-running:queued.description")}</Paragraph>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO title={t("simulations-running:not-running.title")} />
      <div className="m-auto flex w-1/2 flex-1 flex-col items-center justify-center text-center">
        <FileCog className="mx-auto mb-2 h-14 w-14 stroke-primary-600 dark:stroke-primary-400" />
        <H1 className="uppercase">
          {t("simulations-running:not-running.title")}
        </H1>
        <Paragraph>
          {t("simulations-running:not-running.description")}
        </Paragraph>

        <div className="mx-auto mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/simulations/new/apo">
            <Button RightIcon={ArrowRight}>
              {t("navigation:simulations.models.apo")}
            </Button>
          </Link>
          <Link href="/simulations/new/acpype">
            <Button RightIcon={ArrowRight}>
              {t("navigation:simulations.models.acpype")}
            </Button>
          </Link>
          <Link href="/simulations/new/prodrg">
            <Button RightIcon={ArrowRight}>
              {t("navigation:simulations.models.prodrg")}
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
