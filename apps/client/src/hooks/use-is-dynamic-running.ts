/* eslint-disable no-return-assign */
import * as React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { getRunningDynamic } from "@app/queries/useRunningDynamic";

// @see https://usehooks.com/useLockBodyScroll.
export function useIsDynamicRunning() {
  const { data } = useSession();
  const router = useRouter();

  async function checkAndRedirect() {
    if (data && data.user) {
      const running = await getRunningDynamic(data.user.username);

      if (running.status === "running") {
        router.push("/dynamic/running");
      }
    }
  }
  React.useLayoutEffect(() => {
    checkAndRedirect();
  }, []);
}
