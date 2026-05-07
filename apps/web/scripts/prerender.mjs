import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const serverEntryUrl = pathToFileURL(
  path.join(distDir, "server", "entry-server.js"),
).href;

globalThis.window = {
  __ENV__: {
    API_URL: "http://localhost:3001",
  },
};

const { INDEXABLE_ROUTES, renderRoute } = await import(serverEntryUrl);

const template = await readFile(path.join(distDir, "index.html"), "utf8");

for (const routePath of INDEXABLE_ROUTES) {
  const { appHtml, headHtml } = await renderRoute(routePath);
  const html = template
    .replace("<!--app-head-->", headHtml)
    .replace("<!--ssr-outlet-->", appHtml);

  const targetDir =
    routePath === "/"
      ? distDir
      : path.join(distDir, routePath.replace(/^\//, ""));

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), html, "utf8");
}

await rm(path.join(distDir, "server"), { force: true, recursive: true });
