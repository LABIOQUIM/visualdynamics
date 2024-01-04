import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ActiveUserList } from "@/app/[locale]/admin/users/ActiveUserList";
import { getUsers } from "@/app/[locale]/admin/users/getUsers";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { getI18n } from "@/locales/server";

export async function generateMetadata() {
  const t = await getI18n();

  return {
    title: t("admin.users.title")
  };
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/simulations?reason=unauthorized");
  }

  await queryClient.prefetchQuery({
    queryKey: ["Users", "", 10, 1],
    queryFn: () =>
      getUsers({
        page: 1,
        searchByIdentifier: "",
        toTake: 20
      })
  });

  const t = await getI18n();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <H1>{t("admin.users.title")}</H1>
        <ActiveUserList />
      </PageLayout>
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
