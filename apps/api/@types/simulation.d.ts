declare global {
  interface NewSimulationBody {
    forceField: string;
    waterModel: string;
    boxType: string;
    boxDistance: string;
    shouldRun?: boolean;
  }
}

export {};
