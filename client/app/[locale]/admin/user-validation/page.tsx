import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Header } from "@/app/[locale]/admin/user-validation/Header";
import { ValidationTabs } from "@/app/[locale]/admin/user-validation/ValidationTabs";
import { getValidationUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/getValidationUsers";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/simulations?reason=unauthorized");
  }

  queryClient.prefetchQuery({
    queryFn: () => getValidationUsers("rejected"),
    queryKey: ["RejectedUsersList"]
  });

  queryClient.prefetchQuery({
    queryFn: () => getValidationUsers(),
    queryKey: ["InactiveUsersList"]
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <Header />
        <ValidationTabs />
      </PageLayout>
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
