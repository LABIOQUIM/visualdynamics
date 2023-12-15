import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { getI18n } from "@/locales/server";

import { SimulationInformation } from "./Information";

// export function generateMetadata() {
//   const t = await getI18n();
//   return {
//     title: t("running-simulation.description")
//   };
// }

export default async function Page() {
  const t = await getI18n();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <PageLayout>
      <H1>{t("running-simulation.title")}</H1>
      <SimulationInformation username={session.user.username} />
    </PageLayout>
  );
}

export const dynamic = "force-dynamic";
