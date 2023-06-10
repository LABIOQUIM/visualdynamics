/* eslint-disable no-return-assign */
import * as React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { getUserRunningSimulation } from "@app/components/simulations/running/useUserRunningSimulation";

export function useIsDynamicRunning() {
  const { data } = useSession();
  const router = useRouter();

  async function checkAndRedirect() {
    if (data && data.user) {
      const running = await getUserRunningSimulation(data.user.username);

      if (running.status === "running") {
        router.replace("/simulations/running");
      }
    }
  }

  React.useLayoutEffect(() => {
    checkAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
