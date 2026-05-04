import { getAPIClient } from "@/lib/api";

export const fetchArtifact = async (
  target: ArtifactDownloadTarget,
  simulationId: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  const api = await getAPIClient();
  const { data } = await api.get<ArrayBuffer>(`/simulation/downloads/${target}`, {
    params: { simulationId },
    responseType: "arraybuffer",
    ...(onProgress ? { onDownloadProgress: onProgress } : {}),
  });

  return new Blob([data]);
};
