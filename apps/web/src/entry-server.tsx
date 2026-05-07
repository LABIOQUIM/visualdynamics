import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { createMemoryHistory, RouterContextProvider } from "@tanstack/react-router";

import { AppRouter } from "./app";
import { createAppRouter, router as clientRouter } from "./lib/router";
import { INDEXABLE_ROUTES } from "./lib/seo";
import { HeadContent } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof clientRouter;
  }
}

function RouterHead({ router }: { router: typeof clientRouter }) {
  return (
    <RouterContextProvider router={router}>
      <HeadContent />
    </RouterContextProvider>
  );
}

export async function renderRoute(path: string) {
  const history = createMemoryHistory({
    initialEntries: [path],
  });
  const { router } = createAppRouter(history);

  await router.load();

  const appHtml = renderToString(
    <AppRouter
      auth={null}
      router={router}
      withNotifications={false}
    />,
  );

  const headHtml = renderToStaticMarkup(<RouterHead router={router} />);

  return {
    appHtml,
    headHtml,
  };
}

export { INDEXABLE_ROUTES };
