"use server";

import { serverApi } from "@/lib/api";

type Props = {
  username: string;
  type: string;
};

export async function downloadCommands({ type, username }: Props) {
  const { data } = await serverApi.get(
    `/downloads/commands?username=${username}&type=${type}`
  );

  return data;
}
