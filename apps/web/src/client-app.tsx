import { OpenFeature, OpenFeatureProvider } from "@openfeature/react-sdk";

import { AppRouter, ClientLoader } from "./app";
import { authClient } from "./lib/auth-client";
import { ApiFeatureFlagProvider } from "./lib/feature-flags";

OpenFeature.setProvider(new ApiFeatureFlagProvider());

export function ClientApp({
  router,
}: Pick<Parameters<typeof AppRouter>[0], "router">) {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return <ClientLoader />;
  }

  return (
    <OpenFeatureProvider>
      <AppRouter auth={data} router={router} />
    </OpenFeatureProvider>
  );
}
