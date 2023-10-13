"use server";

import { serverApi } from "@/lib/api";

type Props = {
  username: string;
  type: string;
};

export async function downloadResults({ type, username }: Props) {
  const { data } = await serverApi.get(
    `/downloads/figures?username=${username}&type=${type}`,
    {
      responseType: "arraybuffer"
    }
  );

  return Buffer.from(data).toString("base64");
}
