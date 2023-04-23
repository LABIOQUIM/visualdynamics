import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export type GetListDynamicResult =
  | {
      dynamics: Dynamic[];
      status: "listed";
    }
  | {
      status: "no-dynamics" | "no-username";
    };

export async function getAdminSignUpRequestList(): Promise<InactiveUser[]> {
  const { data } = await axios.get<InactiveUser[]>("/api/users/inactive");

  return data;
}

export function useAdminSignUpRequestList(
  options?: UseQueryOptions<InactiveUser[], unknown>
): UseQueryResult<InactiveUser[], unknown> {
  return useQuery({
    queryKey: ["AdminSignUpRequestList"],
    queryFn: () => getAdminSignUpRequestList(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
