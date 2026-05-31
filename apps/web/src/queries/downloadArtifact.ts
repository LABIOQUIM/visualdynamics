import { getAPIClient } from "@/lib/api";

export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export const fetchArtifact = async (
  target: ArtifactDownloadTarget,
  simulationId: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<Blob> => {
  const api = await getAPIClient();
  const { data } = await api.get<ArrayBuffer>(
    `/simulation/downloads/${target}`,
    {
      params: { simulationId },
      responseType: "arraybuffer",
      ...(onProgress
        ? {
            onDownloadProgress: (p) => {
              onProgress({
                ...p,
                percent:
                  p.total > 0 ? Math.round((p.loaded / p.total) * 100) : 0,
              });
            },
          }
        : {}),
    },
  );

  return new Blob([data]);
};
