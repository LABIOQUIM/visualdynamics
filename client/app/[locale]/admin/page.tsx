import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AllTimeSubmissionsLeaderboardChart } from "@/app/[locale]/admin/AllTimeSubmissionsLeaderboardChart";
import { FortnightSubmissionsChart } from "@/app/[locale]/admin/FortnightSubmissionsChart";
import { getMetrics } from "@/app/[locale]/admin/getMetrics";
import { SubmissionsByStatusChart } from "@/app/[locale]/admin/SubmissionsByStatusChart";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { getI18n } from "@/locales/server";

export default async function Page() {
  const data = await getMetrics();
  const session = await getServerSession(authOptions);
  const t = await getI18n();

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/simulations?reason=unauthorized");
  }

  return (
    <PageLayout>
      <H1>Admin Dashboard</H1>

      <div className="h-80 w-full">
        {data.lastMonthSubmissions && (
          <FortnightSubmissionsChart data={data.lastMonthSubmissions} />
        )}
      </div>
      <div className="flex flex-1 gap-6">
        <div className="w-1/4">
          <SubmissionsByStatusChart data={data.submissionsByStatus} />
        </div>
        <div className="grid w-1/4 grid-flow-col grid-rows-2">
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
              {data.submissionsByStatus.find((s) => s.status === "QUEUED")
                ?._count ?? 0}
            </p>
            <p className="text-xl font-bold uppercase text-yellow-600 dark:text-yellow-200">
              {t("admin.dashboard.statuses.queued")}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-indigo-500 dark:text-indigo-400">
              {data.submissionsByStatus.find((s) => s.status === "RUNNING")
                ?._count ?? 0}
            </p>
            <p className="text-xl font-bold uppercase text-indigo-600 dark:text-indigo-300">
              {t("admin.dashboard.statuses.running")}
            </p>
          </div>
        </div>
        <div className="w-2/4">
          <AllTimeSubmissionsLeaderboardChart data={data.leaderboard} />
        </div>
      </div>
    </PageLayout>
  );
}
