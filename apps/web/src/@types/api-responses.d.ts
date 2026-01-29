export {};

declare global {
  type SimulationDetails = {
    isRunning: boolean;
    queue: number;
    stepData: string[];
    logData: string[];
    simulation: Simulation;
    molecules: {
      macromolecule: string;
      ligand: string;
    };
  };
}
