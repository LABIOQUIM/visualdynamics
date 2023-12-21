import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getMDPSettings } from "@/app/[locale]/admin/settings/MDPSettings/getMDPSettings";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { getI18n } from "@/locales/server";

import { AppSettings } from "./AppSettings";
import { MDPSettings } from "./MDPSettings";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const t = await getI18n();

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/simulations?reason=unauthorized");
  }

  queryClient.prefetchQuery({
    queryKey: ["MDPSettings"],
    queryFn: () => getMDPSettings()
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <H1 className="uppercase">{t("admin.settings.title")}</H1>

        <div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-3">
          <MDPSettings />
          <AppSettings />
        </div>
      </PageLayout>
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
