import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt/server")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/mgmt/server!</div>;
}
