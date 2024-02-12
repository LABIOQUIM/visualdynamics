import { prisma } from "@/lib/prisma";

export async function getMetrics() {
  const lastMonthSubmissions: {
    date: string;
    submissions: number;
    completed: number;
    errored: number;
    queued: number;
    running: number;
    canceled: number;
  }[] = await prisma.$queryRaw`
    WITH dates AS (
      SELECT generate_series(DATE_TRUNC('day', NOW()) - INTERVAL '14 days', DATE_TRUNC('day', NOW()), INTERVAL '1 day') AS date
    )
    SELECT
      dates.date::varchar AS date,
      COALESCE(COUNT(simulations.created_at), 0)::integer AS submissions,
      COALESCE(SUM(CASE WHEN simulations.status = 'COMPLETED' THEN 1 ELSE 0 END), 0)::integer AS completed,
      COALESCE(SUM(CASE WHEN simulations.status = 'ERRORED' THEN 1 ELSE 0 END), 0)::integer AS errored,
      COALESCE(SUM(CASE WHEN simulations.status = 'QUEUED' THEN 1 ELSE 0 END), 0)::integer AS queued,
      COALESCE(SUM(CASE WHEN simulations.status = 'RUNNING' THEN 1 ELSE 0 END), 0)::integer AS running,
      COALESCE(SUM(CASE WHEN simulations.status = 'CANCELED' THEN 1 ELSE 0 END), 0)::integer AS canceled
    FROM dates
    LEFT JOIN simulations ON DATE(simulations.created_at) = dates.date
    GROUP BY dates.date
    ORDER BY dates.date;
  `;

  const submissionsByStatus = await prisma.simulation.groupBy({
    by: "status",
    _count: true
  });

  const leaderboard: {
    username: string;
    submissions: number;
  }[] = await prisma.$queryRaw`
    SELECT users.username, COUNT(*)::integer AS submissions
    FROM simulations
    JOIN users ON simulations.user_id = users.id
    GROUP BY users.username
    ORDER BY submissions DESC
    LIMIT 10;
  `;

  return {
    submissionsByStatus,
    lastMonthSubmissions,
    leaderboard
  };
}
