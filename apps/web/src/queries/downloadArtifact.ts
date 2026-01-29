import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";

export const fetchArtifact = async (
  target: ArtifactDownloadTarget,
  simulationId: string,
) => {
  const api = await getAPIClient();

  return api
    .get<ArrayBuffer>(`/simulation/downloads/${target}`, {
      params: { simulationId },
      responseType: "arraybuffer",
    })
    .then((r) => r.data);
};

export const downloadArtifact = (
  target: ArtifactDownloadTarget,
  simulationId: string,
) =>
  queryOptions({
    queryKey: ["artifact", target, simulationId],
    queryFn: () => fetchArtifact(target, simulationId),
    enabled: false,
  });
