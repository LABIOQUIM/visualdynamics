export {};

declare global {
  type USER_ROLE = "USER" | "ADMINISTRATOR";
  type SIMULATION_TYPE = "apo" | "acpype";
  type SIMULATION_STATUS =
    | "QUEUED"
    | "RUNNING"
    | "COMPLETED"
    | "CANCELED"
    | "ERRORED"
    | "GENERATED";

  type StepState = "done" | "inprogress" | "waiting";

  type SimulationLigand = {
    ligandITPName: string;
    ligandPDBName: string;
    position: number;
  };

  type Simulation = {
    id: string;
    userId: string;
    moleculeName: string;
    type: SIMULATION_TYPE;
    startedAt: Date | null;
    endedAt: Date | null;
    status: SIMULATION_STATUS;
    errorCause: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    ligands: SimulationLigand[];
    storageExpiresAt: string | null;
    storageDeletedAt: string | null;
  };

  type SimulationWithUser = Simulation & {
    user: {
      username: string;
    };
  };
}
