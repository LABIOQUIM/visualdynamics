"use client";
import { Simulation } from "@prisma/client";
import { FileDigit } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

import { downloadFigures } from "./downloadFigures";

type Props = {
  simulation: Simulation;
  variants: { [key: string]: Variant };
};

export function DownloadFigures({ simulation, variants }: Props) {
  const t = useI18n();
  const { data: session } = useSession();

  async function handleDownload() {
    if (session) {
      const data = await downloadFigures({
        username: session.user.username,
        type: simulation.type
      });

      const link = document.createElement("a");
      link.download = `${simulation.type}-${simulation.moleculeName}-${simulation.createdAt}-figures.zip`;
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
      disabled={
        simulation.status === "RUNNING" || simulation.status === "QUEUED"
      }
      LeftIcon={FileDigit}
      onClick={handleDownload}
      variant={variants[simulation.status]}
    >
      {t("simulations.downloads.figures")}
    </Button>
  );
}
