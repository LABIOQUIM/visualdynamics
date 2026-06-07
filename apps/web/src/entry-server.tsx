import {
  HeadContent,
  RouterContextProvider,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

import { getRouter } from "@/router";
import {
  DEFAULT_SITE_URL,
  PUBLIC_INDEXABLE_PATHS,
  buildRobotsTxt,
  buildSitemapXml,
} from "@/lib/seo";

export {
  DEFAULT_SITE_URL,
  PUBLIC_INDEXABLE_PATHS,
  buildRobotsTxt,
  buildSitemapXml,
};

export async function renderPublicRoute(pathname: string) {
  const history = createMemoryHistory({ initialEntries: [pathname] });
  const router = getRouter({ history });

  await router.load();

  const head = renderToStaticMarkup(
    <RouterContextProvider router={router}>
      <HeadContent />
    </RouterContextProvider>,
  );
  const html = renderToString(<RouterProvider router={router} />);

  return { head, html };
}
