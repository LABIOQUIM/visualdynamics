import classes from "./server.module.css";

import { useMemo, useState } from "react";
import { Alert, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "@/components/PageLayout";
import {
  getSimulationQueueDiagnostics,
  type SimulationQueueDiagnosticsPagination,
} from "@/queries/getSimulationQueueDiagnostics";
import { getSystemInfo } from "@/queries/getSystemInfo";

import {
  JobStateTable,
  JobTable,
  type JobTableRecord,
} from "./-components/JobStateTable";
import { QueueSummary } from "./-components/QueueSummary";
import { ServerMetrics } from "./-components/ServerMetrics";
import {
  getInitialQueuePagination,
  setQueuePagination,
} from "./-components/pagination";

export const Route = createFileRoute("/_protected/admin/server/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [waitingPagination, setWaitingPagination] = useState(getInitialQueuePagination);
  const [activePagination, setActivePagination] = useState(getInitialQueuePagination);
  const [failedPagination, setFailedPagination] = useState(getInitialQueuePagination);
  const [queuedPagination, setQueuedPagination] = useState(getInitialQueuePagination);
  const queuePagination = useMemo<SimulationQueueDiagnosticsPagination>(
    () => ({
      waitingPage: waitingPagination.pageIndex,
      activePage: activePagination.pageIndex,
      failedPage: failedPagination.pageIndex,
      queuedPage: queuedPagination.pageIndex,
    }),
    [
      activePagination.pageIndex,
      failedPagination.pageIndex,
      queuedPagination.pageIndex,
      waitingPagination.pageIndex,
    ],
  );
  const systemInfo = useQuery(getSystemInfo());
  const queueDiagnostics = useQuery(getSimulationQueueDiagnostics(queuePagination));
  const queueData = queueDiagnostics.data;
  const queuedSimulationJobs = useMemo<PaginatedRecords<JobTableRecord>>(
    () => ({
      records:
        queueData?.queuedSimulations.records.map((simulation) => ({
          attemptsMade: null,
          finishedAt: simulation.updatedAt,
          id: simulation.jobId,
          requeueSubmissionId: null,
          startedAt: simulation.createdAt,
          username: simulation.username,
        })) ?? [],
      total: queueData?.queuedSimulations.total ?? 0,
    }),
    [queueData?.queuedSimulations],
  );

  return (
    <PageLayout title="Server Statistics">
      {(systemInfo.isError || queueDiagnostics.isError) && (
        <Alert color="red" title="Unable to load server diagnostics" variant="light">
          {systemInfo.error instanceof Error
            ? systemInfo.error.message
            : queueDiagnostics.error instanceof Error
              ? queueDiagnostics.error.message
              : "The server diagnostics request failed."}
        </Alert>
      )}

      {systemInfo.isLoading && queueDiagnostics.isLoading ? (
        <div className={classes.loading}>
          <Loader />
        </div>
      ) : (
        <>
          <ServerMetrics systemInfo={systemInfo.data} />
          <QueueSummary queueData={queueData} />

          <div className={classes.jobsGrid}>
            <JobStateTable
              isFetching={queueDiagnostics.isFetching}
              isLoading={queueDiagnostics.isLoading}
              jobs={queueData?.recentJobs.waiting ?? { records: [], total: 0 }}
              onPaginationChange={(updater) => setQueuePagination(setWaitingPagination, updater)}
              pagination={waitingPagination}
              title="Waiting Jobs"
            />
            <JobStateTable
              isFetching={queueDiagnostics.isFetching}
              isLoading={queueDiagnostics.isLoading}
              jobs={queueData?.recentJobs.active ?? { records: [], total: 0 }}
              onPaginationChange={(updater) => setQueuePagination(setActivePagination, updater)}
              pagination={activePagination}
              title="Active Jobs"
            />
            <JobStateTable
              isFetching={queueDiagnostics.isFetching}
              isLoading={queueDiagnostics.isLoading}
              jobs={queueData?.recentJobs.failed ?? { records: [], total: 0 }}
              onPaginationChange={(updater) => setQueuePagination(setFailedPagination, updater)}
              pagination={failedPagination}
              title="Failed Jobs"
            />
            <JobTable
              data={queuedSimulationJobs}
              emptyMessage="No queued simulations to show."
              isFetching={queueDiagnostics.isFetching}
              isLoading={queueDiagnostics.isLoading}
              onRequeue={undefined}
              onPaginationChange={(updater) => setQueuePagination(setQueuedPagination, updater)}
              pagination={queuedPagination}
              requeueingSubmissionId={undefined}
              title="Queued Simulations"
            />
          </div>
        </>
      )}
    </PageLayout>
  );
}
