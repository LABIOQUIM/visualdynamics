import { getAPIClient } from "@/lib/api";

export async function deleteUserFile(
  userId: string,
  path: string,
): Promise<{ success: boolean }> {
  const api = await getAPIClient();
  return api
    .delete<{ success: boolean }>("/simulation/admin/delete-user-file", {
      params: { userId, path },
    })
    .then((r) => r.data);
}
