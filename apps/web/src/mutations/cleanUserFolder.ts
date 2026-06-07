import { getAPIClient } from "@/lib/api";

export async function cleanUserFolder(userId: string) {
  const api = await getAPIClient();
  return api
    .post<{ success: boolean }>("/simulation/admin/clean-user-folder", {
      userId,
    })
    .then((r) => r.data);
}
