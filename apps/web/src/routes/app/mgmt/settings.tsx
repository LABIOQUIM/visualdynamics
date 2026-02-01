import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/mgmt/settings!</div>;
}
