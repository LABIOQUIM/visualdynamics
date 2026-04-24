import { authClient } from "@/lib/auth-client";

const API_BASE = "http://localhost:3001/v1";

export const fetchArtifact = async (
  target: ArtifactDownloadTarget,
  simulationId: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  const session = await authClient.getSession();
  const token = session.data?.session.token;

  const url = `${API_BASE}/simulation/downloads/${target}?simulationId=${encodeURIComponent(simulationId)}`;

  const response = await fetch(url, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) throw new Error("No response body");
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value as Uint8Array<ArrayBuffer>);
    received += value.length;
    if (total > 0 && onProgress) {
      onProgress((received / total) * 100);
    }
  }

  return new Blob(chunks);
};
