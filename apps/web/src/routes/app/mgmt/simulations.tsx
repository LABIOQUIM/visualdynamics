import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt/simulations")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /app/mgmt/simulations!</div>;
}
