/* eslint-disable no-return-assign */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { getRunningSimulation } from "@/app/[locale]/(simulation)/running-simulation/getRunningSimulation";

export function useIsDynamicRunning() {
  const { data } = useSession();
  const router = useRouter();

  async function checkAndRedirect() {
    if (data && data.user) {
      const running = await getRunningSimulation(data.user.username);

      if (running.status === "running" || running.status === "queued") {
        router.replace("/simulations/running");
      }
    }
  }

  React.useLayoutEffect(() => {
    checkAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
