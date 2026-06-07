import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export interface FolderEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  lastModified: number;
}

export const fetchUserFolderFiles = async (
  userId: string,
  path: string,
): Promise<FolderEntry[]> => {
  const api = await getAPIClient();
  return api
    .get<FolderEntry[]>("/simulation/admin/list-user-folder", {
      params: { userId, path },
    })
    .then((r) => r.data);
};

export const getUserFolderFiles = (userId: string, path: string) =>
  queryOptions({
    queryKey: QUERY_KEYS.mgmtUserFolder(userId, path),
    queryFn: () => fetchUserFolderFiles(userId, path),
  });
