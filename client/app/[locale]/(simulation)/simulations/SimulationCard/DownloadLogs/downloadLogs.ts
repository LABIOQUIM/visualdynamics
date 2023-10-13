"use server";

import { serverApi } from "@/lib/api";

type Props = {
  username: string;
  type: string;
};

export async function downloadLogs({ type, username }: Props) {
  const { data } = await serverApi.get(
    `/downloads/log?username=${username}&type=${type}`
  );

  return data;
}
