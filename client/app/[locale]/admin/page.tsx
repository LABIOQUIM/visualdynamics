import { AllTimeSubmissionsLeaderboardChart } from "@/app/[locale]/admin/AllTimeSubmissionsLeaderboardChart";
import { FortnightSubmissionsChart } from "@/app/[locale]/admin/FortnightSubmissionsChart";
import { getMetrics } from "@/app/[locale]/admin/getMetrics";
import { SubmissionsByStatusChart } from "@/app/[locale]/admin/SubmissionsByStatusChart";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";

export default async function Page() {
  const data = await getMetrics();

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
