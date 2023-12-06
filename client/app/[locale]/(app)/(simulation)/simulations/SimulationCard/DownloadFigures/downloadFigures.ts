"use server";

import { serverApi } from "@/lib/api";

type Props = {
  username: string;
  type: string;
};

export async function downloadFigures({ type, username }: Props) {
  const { data } = await serverApi.get(
    `/downloads/results?username=${username}&type=${type}`,
    {
      responseType: "arraybuffer"
    }
  );

  return Buffer.from(data).toString("base64");
}
