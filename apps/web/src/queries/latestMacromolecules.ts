import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";

export type LatestMacromolecules = {
  macromolecule: string;
  ligandItp?: string;
  ligandPdb?: string;
};

export const fetchLatestMacromolecules = async (type: SIMULATION_TYPE) => {
  const api = await getAPIClient();

  return api
    .get<LatestMacromolecules>(`/simulation/macromolecule/${type}`)
    .then((r) => r.data);
};

export const latestMacromoleculesQuery = (type: SIMULATION_TYPE) =>
  queryOptions({
    queryKey: ["latest-macromolecule", type],
    queryFn: () => fetchLatestMacromolecules(type),
  });
