"use server";
import { SIMULATION_TYPE } from "database";

import { api } from "@/lib/apis";

import { validateAuth } from "../auth/validateAuth";

export type LatestSimulations = {
  macromolecule: string;
  ligandItp?: string;
  ligandPdb?: string;
};

export async function getLatestSimulationMacromolecules(type: SIMULATION_TYPE) {
  const { user } = await validateAuth();

  if (!user) {
    return "unauthenticated";
  }

  const response = await api.get<LatestSimulations>(
    `/simulation/macromolecule/${type}`,
    {
      headers: {
        "x-username": user.userName,
      },
    }
  );

  return response.data;
}
