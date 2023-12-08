import { getServerSession } from "next-auth";

import { SimulationList } from "@/app/[locale]/(simulation)/simulations/SimulationList";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  return (
    <PageLayout>
      <SimulationList username={session.user.username} />
    </PageLayout>
  );
}
