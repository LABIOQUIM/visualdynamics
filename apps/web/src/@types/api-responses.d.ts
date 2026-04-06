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
}
