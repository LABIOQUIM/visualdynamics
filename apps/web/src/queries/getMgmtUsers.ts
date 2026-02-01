import { queryOptions } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

export const fetchMgmtUsers = async () => {
  const { data, error } = await authClient.admin.listUsers({
    query: {},
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getMgmtUsers = () =>
  queryOptions({
    queryKey: ["mgmt-users"],
    queryFn: () => fetchMgmtUsers(),
  });
