import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { QUERY_KEYS } from "@/lib/queryKeys";

export const fetchMgmtUser = async (userId: string) => {
  const { data, error } = await authClient.admin.getUser({
    query: {
      id: userId,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getMgmtUser = (userId: string) =>
  queryOptions({
    queryKey: QUERY_KEYS.mgmtUser(userId),
    queryFn: () => fetchMgmtUser(userId),
  });
