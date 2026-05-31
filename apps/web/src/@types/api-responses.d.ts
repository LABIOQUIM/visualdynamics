export {};

declare global {
  type SimulationDetails = {
    isActive: boolean;
    isStored: boolean;
    queuePosition: number;
    jobId: string;
    stepData: string[];
    logData: string[];
    simulation: Simulation;
    molecules: {
      macromolecule: string;
      ligands: string[];
    };
  };

  type SystemInfo = {
    cpu: {
      brand: string;
      vendor: string;
      cores: number;
      physicalCores: number;
    };
    load: {
      current: number;
      average: number;
    };
    mem: {
      total: number;
      used: number;
    };
    fs: {
      size: number;
      used: number;
      available: number;
    };
  };

  type SimulationQueueJobSummary = {
    id?: string;
    username: string | null;
    name: string;
    state: string;
    simulationId: string | null;
    attemptsMade: number;
    failedReason: string | null;
    timestamp: number;
    processedOn?: number;
    finishedOn?: number;
  };

  type QueuedSimulationDiagnostic = {
    id: string;
    username: string;
    moleculeName: string;
    type: SIMULATION_TYPE;
    jobId: string | null;
    redisState: string | null;
    errorCause: string | null;
    createdAt: string;
    updatedAt: string | null;
  };

  type PaginatedRecords<TRecord> = {
    records: TRecord[];
    total: number;
  };

  type SimulationQueueDiagnostics = {
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
}
