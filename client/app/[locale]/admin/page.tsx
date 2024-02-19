import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AllTimeSubmissionsLeaderboardChart } from "@/app/[locale]/admin/AllTimeSubmissionsLeaderboardChart";
import { FortnightSubmissionsChart } from "@/app/[locale]/admin/FortnightSubmissionsChart";
import { getMetrics } from "@/app/[locale]/admin/getMetrics";
import { SubmissionsByStatusChart } from "@/app/[locale]/admin/SubmissionsByStatusChart";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const data = await getMetrics();
  const session = await getServerSession(authOptions);

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
        <div className="w-3/4">
          <AllTimeSubmissionsLeaderboardChart data={data.leaderboard} />
        </div>
      </div>
    </PageLayout>
  );
}
