import { getMgmtUser } from "@/queries/getMgmtUser";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/users/$userId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const user = await context.queryClient.ensureQueryData(
      getMgmtUser(params.userId),
    );
    return { username: user.username };
  },
  staticData: {
    breadcrumb: ({ loaderData }) => loaderData?.username ?? "...",
  },
});

function RouteComponent() {
  return <Outlet />;
}
