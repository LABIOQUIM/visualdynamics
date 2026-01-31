import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /(home)/privacy!</div>;
}
