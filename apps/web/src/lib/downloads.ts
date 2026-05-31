export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface DownloadEntry {
  id: string;
  label: string;
  fileName: string;
  fileType: string;
  simulationLabel: string;
  startedAt: number;
  progress: DownloadProgress;
  status: "active" | "complete" | "error";
}

type Listener = () => void;
const listeners = new Set<Listener>();
const downloads = new Map<string, DownloadEntry>();
let cached: DownloadEntry[] = [];

function notify() {
  cached = Array.from(downloads.values()).reverse();
  for (const fn of listeners) fn();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getDownloads(): DownloadEntry[] {
  return cached;
}

export function startDownload(
  id: string,
  label: string,
  fileName: string,
  fileType: string,
  simulationLabel: string,
): void {
  downloads.set(id, {
    id,
    label,
    fileName,
    fileType,
    simulationLabel,
    startedAt: Date.now(),
    progress: { loaded: 0, total: 0, percent: 0 },
    status: "active",
  });
  notify();
}

export function updateProgress(id: string, progress: DownloadProgress): void {
  const entry = downloads.get(id);
  if (entry) {
    entry.progress = progress;
    notify();
  }
}

export function completeDownload(id: string): void {
  const entry = downloads.get(id);
  if (entry) {
    entry.status = "complete";
    notify();
  }
}

export function failDownload(id: string): void {
  const entry = downloads.get(id);
  if (entry) {
    entry.status = "error";
    notify();
  }
}

export function removeDownload(id: string): void {
  downloads.delete(id);
  notify();
}

export function clearCompleted(): void {
  for (const [id, entry] of downloads) {
    if (entry.status !== "active") downloads.delete(id);
  }
  notify();
}
