import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

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
    queryKey: ["mgmt-user", userId],
    queryFn: () => fetchMgmtUser(userId),
  });
