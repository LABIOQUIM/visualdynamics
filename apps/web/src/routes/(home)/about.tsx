import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(home)/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /(home)/about!</div>;
}
