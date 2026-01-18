import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";

export const fetchArtifact = async (
  target: ArtifactDownloadTarget,
  type: SIMULATION_TYPE,
) => {
  const api = await getAPIClient();

  return api
    .get<ArrayBuffer>(`/simulation/downloads/${target}`, {
      params: { type },
      responseType: "arraybuffer",
    })
    .then((r) => r.data);
};

export const artifactDownloadQuery = (
  target: ArtifactDownloadTarget,
  type: SIMULATION_TYPE,
) =>
  queryOptions({
    queryKey: ["artifact", target, type],
    queryFn: () => fetchArtifact(target, type),
    enabled: false,
  });
