import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt/users")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/mgmt/users!</div>;
}
