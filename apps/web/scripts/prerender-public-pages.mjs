import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const distDir = path.join(webRoot, "dist");
const serverEntryUrl = pathToFileURL(path.join(webRoot, "dist-ssr", "entry-server.js")).href;

const {
  DEFAULT_SITE_URL,
  PUBLIC_INDEXABLE_PATHS,
  buildRobotsTxt,
  buildSitemapXml,
  renderPublicRoute,
} = await import(serverEntryUrl);

const template = await readFile(path.join(distDir, "index.html"), "utf8");

function stripDefaultHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+name="description"[\s\S]*?>\s*/gi, "")
    .replace(/<meta\s+name="robots"[\s\S]*?>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[\s\S]*?>\s*/gi, "");
}

function injectHead(html, head) {
  const managedHeadPattern = /<!--app-head-start-->[\s\S]*?<!--app-head-end-->/;

  if (managedHeadPattern.test(html)) {
    return html.replace(
      managedHeadPattern,
      `<!--app-head-start-->\n    ${head}\n    <!--app-head-end-->`,
    );
  }

  return stripDefaultHead(html).replace("</head>", `    ${head}\n  </head>`);
}

function injectRoot(html, appHtml) {
  return html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${appHtml}</div>`);
}

function getOutputPath(publicPath) {
  if (publicPath === "/") {
    return path.join(distDir, "index.html");
  }

  return path.join(distDir, publicPath.replace(/^\/+/, ""), "index.html");
}

for (const publicPath of PUBLIC_INDEXABLE_PATHS) {
  const { head, html } = await renderPublicRoute(publicPath);
  const outputHtml = injectRoot(injectHead(template, head), html);
  const outputPath = getOutputPath(publicPath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, outputHtml);
}

await writeFile(path.join(distDir, "robots.txt"), buildRobotsTxt(DEFAULT_SITE_URL));
await writeFile(path.join(distDir, "sitemap.xml"), buildSitemapXml(DEFAULT_SITE_URL));
