"use client";
import { Scroll } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

import { downloadLogs } from "./downloadLogs";

type Props = {
  simulation: Simulation;
  variants: { [key: string]: Variant };
};

export function DownloadLogs({ simulation, variants }: Props) {
  const t = useI18n();
  const { data: session } = useSession();

  async function handleDownload() {
    if (session) {
      const data = await downloadLogs({
        username: session.user.username,
        type: simulation.type,
        molecule: simulation.molecule,
        timestamp: simulation.timestamp
      });

      const link = document.createElement("a");
      link.download = `${simulation.type}-${simulation.molecule}-${simulation.timestamp}-logs.txt`;
      link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(data);
      link.click();
    }
  }

  return (
    <Button
      className="w-full md:w-fit"
      disabled={
        simulation.status === "running" || simulation.status === "queued"
      }
      LeftIcon={Scroll}
      onClick={handleDownload}
      variant={variants[simulation.status]}
    >
      {t("simulations.downloads.log")}
    </Button>
  );
}
