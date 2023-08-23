"use server";

import { serverApi } from "@/lib/api";

type Props = {
  username: string;
  type: string;
  molecule: string;
  timestamp: string;
};

export async function downloadResults({
  type,
  timestamp,
  username,
  molecule
}: Props) {
  const { data } = await serverApi.get(
    `/downloads/figures?username=${username}&type=${type}&molecule=${molecule}&timestamp=${timestamp}`,
    {
      responseType: "arraybuffer"
    }
  );

  return Buffer.from(data).toString("base64");
}
