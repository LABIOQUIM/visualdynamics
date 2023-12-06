"use client";
import { FileDown } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

import { downloadMDP } from "./downloadMDP";

export function DownloadMDP() {
  const t = useI18n();
  const { data: session } = useSession();

  async function handleDownload() {
    if (session) {
      const data = await downloadMDP();

      const link = document.createElement("a");
      link.download = `visualdynamics-mdpfiles.zip`;
      const blobUrl = window.URL.createObjectURL(
        new Blob([new Uint8Array(Buffer.from(data, "base64"))])
      );

      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    }
  }

  return (
    <Button
      className="w-full md:w-fit"
      LeftIcon={FileDown}
      onClick={handleDownload}
    >
      {t("simulations.downloads.mdp")}
    </Button>
  );
}
