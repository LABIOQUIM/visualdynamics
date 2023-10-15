import { Simulation as PSimulation } from "@prisma/client";

declare global {
  interface Simulation extends PSimulation {}
}

export {};
