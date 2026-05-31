import { useSyncExternalStore } from "react";

import {
  getDownloads,
  subscribe,
  type DownloadEntry,
} from "@/lib/downloads";

export function useDownloads(): DownloadEntry[] {
  return useSyncExternalStore(subscribe, getDownloads);
}
