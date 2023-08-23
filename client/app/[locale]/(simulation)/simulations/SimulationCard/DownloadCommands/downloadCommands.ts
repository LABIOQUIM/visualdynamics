"use server";

import { serverApi } from "@/lib/api";

type Props = {
  username: string;
  type: string;
  molecule: string;
  timestamp: string;
};

export async function downloadCommands({
  type,
  timestamp,
  username,
  molecule
}: Props) {
  const { data } = await serverApi.get(
    `/downloads/commands?username=${username}&type=${type}&molecule=${molecule}&timestamp=${timestamp}`
  );

  return data;
}
