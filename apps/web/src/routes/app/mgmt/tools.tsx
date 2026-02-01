import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt/tools")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/mgmt/tools!</div>;
}
