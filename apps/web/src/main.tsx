import { createRoot, hydrateRoot } from "react-dom/client";

import { ClientApp } from "./client-app";
import { router } from "./lib/router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById("app")!;
const app = <ClientApp router={router} />;

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
