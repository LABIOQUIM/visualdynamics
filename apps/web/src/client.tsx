import { RouterProvider } from "@tanstack/react-router";
import { createRoot, hydrateRoot } from "react-dom/client";

import { getRouter } from "@/router";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

const app = <RouterProvider router={getRouter()} />;

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
