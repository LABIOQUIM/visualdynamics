import { SIMULATION_TYPE, User } from "../generated/prisma/client.js";

export interface NewSimulationBody {
  type: SIMULATION_TYPE;
  forceField: string;
  waterModel: string;
  boxType: string;
  boxDistance: string;
  successEmail: string;
  errorEmail: string;
  shouldRun?: "true" | "false";
}

export interface SimulateData {
  simulationId: string;
  user: User;
  type: SIMULATION_TYPE;
  successEmail: string;
  errorEmail: string;
}

export type SimulationQueueDiagnosticsPagination = {
  waitingPage?: number | undefined;
  activePage?: number | undefined;
  failedPage?: number | undefined;
  queuedPage?: number | undefined;
};

export type SimulationQueueJobSummary = {
  id: string | undefined;
  username: string | null;
  name: string;
  state: string;
  simulationId: string | null;
  attemptsMade: number;
  failedReason: string | null;
  timestamp: number;
  processedOn: number | undefined;
  finishedOn: number | undefined;
};

export type QueuedSimulationDiagnostic = {
  id: string;
  username: string;
  moleculeName: string;
  type: SIMULATION_TYPE;
  jobId: string | null;
  redisState: string | null;
  errorCause: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

export type PaginatedRecords<TRecord> = {
  records: TRecord[];
  total: number;
};

export type SimulationQueueDiagnostics = {
  counts: Record<string, number>;
  paused: boolean;
  workerCount: number;
  recentJobs: {
    waiting: PaginatedRecords<SimulationQueueJobSummary>;
    active: PaginatedRecords<SimulationQueueJobSummary>;
    failed: PaginatedRecords<SimulationQueueJobSummary>;
  };
  queuedSimulations: PaginatedRecords<QueuedSimulationDiagnostic>;
};
