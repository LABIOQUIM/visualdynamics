"use server";

import { serverApi } from "@/lib/api";

export async function fetchDataTree(username: string) {
  const { data } = await serverApi.get<Tree>("/simulations/tree", {
    params: {
      username
    }
  });

  console.log(data);

  return data;
}
