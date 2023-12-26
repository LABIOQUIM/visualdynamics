"use server";
import { serverApi } from "@/lib/api";

export async function downloadFile(filePath: string) {
  const { data } = await serverApi.get(`/downloads/file?fullPath=${filePath}`, {
    responseType: "arraybuffer"
  });

  return Buffer.from(data).toString("base64");
}
