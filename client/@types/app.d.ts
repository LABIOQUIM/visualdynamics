import { Simulation } from "@prisma/client";
import { User } from "next-auth";

import { boxTypes } from "@/utils/boxTypes";
import {
  acpypeForceFields,
  apoForceFields,
  prodrgForceFields
} from "@/utils/forceFields";
import { waterModels } from "@/utils/waterModels";

declare global {
  type PropsWithUser<P = object> = P & {
    user: User;
  };

  type Variant =
    | "primary"
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "grayscale";

  type PureTree = {
    type: "directory" | "file";
    name: string;
    children?: PureTree[];
  };

  type Tree =
    | PureTree
    | {
        status: "not-found";
      };

  // NEW SIMULATIONS
  type NewSimulationBase = {
    waterModel: keyof typeof waterModels;
    boxType: keyof typeof boxTypes;
    boxDistance: string;
    bootstrap: boolean;
    neutralize: boolean;
    double: boolean;
    ignore: boolean;
    username: string;
    user_email: string;
  };

  type NewAPOSimulationProps = NewSimulationBase & {
    forceField: keyof typeof apoForceFields;
  };

  type NewACPYPESimulationProps = NewSimulationBase & {
    forceField: keyof typeof acpypeForceFields;
  };

  type NewPRODRGSimulationProps = NewSimulationBase & {
    forceField: keyof typeof prodrgForceFields;
  };

  // QUERY RESULTS
  interface GetSimulationsReturn {
    apo?: Simulation;
    acpype?: Simulation;
    prodrg?: Simulation;
  }

  type GetMDPSettingsResult =
    | {
        status: "not-found";
      }
    | {
        status: "found";
        nsteps: number;
        dt: number;
      };

  type GetCelerySimulationsResult = {
    [key: string]: {
      id: string;
      name: string;
      args: string[];
      type: string;
      time_start: number;
      acknowledged: boolean;
      worker_pid: number;
    }[];
  };
}
