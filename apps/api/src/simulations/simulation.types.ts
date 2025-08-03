import { SIMULATION_TYPE, User } from "database";

export interface NewSimulationBody {
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
