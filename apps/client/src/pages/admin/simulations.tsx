import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

import { useActiveSimulations } from "@app/components/admin/simulations/active/useActiveSimulations";
import { useQueuedSimulations } from "@app/components/admin/simulations/queued/useQueuedSimulations";
import { TriggerRun } from "@app/components/admin/simulations/trigger-run";
import { AlertFailedToFetch } from "@app/components/general/alerts/failed-to-fetch";
import { PageLoadingIndicator } from "@app/components/general/loading-indicator/full-page";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { PageLayout } from "@app/components/general/page-layout";
import { H1, H2 } from "@app/components/general/typography/headings";
import { SEO } from "@app/components/seo";
import { withSSRAdmin } from "@app/hocs/withSSRAdmin";

const ActiveSimulationsList = dynamic(
  () =>
    import("@app/components/admin/simulations/active").then(
      (mod) => mod.ActiveSimulationsList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

const QueuedSimulationsList = dynamic(
  () =>
    import("@app/components/admin/simulations/queued").then(
      (mod) => mod.QueuedSimulationsList
    ),
  {
    loading: () => <PageLoadingIndicator />,
    ssr: false
  }
);

export const getServerSideProps = withSSRAdmin();

export default function SimulationsStatus() {
  const {
    data: activeSimulations,
    isRefetching: isRefetchingActiveSimulations,
    isLoading: isLoadingActiveSimulations,
    refetch: refetchActiveSimulations
  } = useActiveSimulations({
    refetchOnMount: true
  });
  const {
    data: queuedSimulations,
    isRefetching: isRefetchingQueuedSimulations,
    isLoading: isLoadingQueuedSimulations,
    refetch: refetchQueuedSimulations
  } = useQueuedSimulations({
    refetchOnMount: true
  });
  const { t } = useTranslation();

  return (
    <PageLayout>
      <SEO
        title={t("admin-simulations:title")}
        description={t("admin-simulations:description")}
      />
      <div className="flex gap-x-2">
        <H1 className="uppercase">{t("admin-simulations:title")}</H1>
        {isLoadingActiveSimulations ||
        isRefetchingActiveSimulations ||
        isLoadingQueuedSimulations ||
        isRefetchingQueuedSimulations ? (
          <Spinner />
        ) : null}
      </div>

      <TriggerRun />

      <H2>{t("admin-simulations:active")}</H2>
      {isLoadingActiveSimulations ? (
        <PageLoadingIndicator />
      ) : !activeSimulations ? (
        <AlertFailedToFetch />
      ) : (
        <ActiveSimulationsList
          refetch={refetchActiveSimulations}
          workers={activeSimulations}
        />
      )}

      <H2>{t("admin-simulations:queued")}</H2>
      {isLoadingQueuedSimulations ? (
        <PageLoadingIndicator />
      ) : !queuedSimulations ? (
        <AlertFailedToFetch />
      ) : (
        <QueuedSimulationsList
          refetch={refetchQueuedSimulations}
          workers={queuedSimulations}
        />
      )}
    </PageLayout>
  );
}
