import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import app from "../dist/server/server.js";

const PORT = Number(process.env.SSR_PORT ?? "3001");
const HOST = process.env.SSR_HOST ?? "0.0.0.0";
const CLIENT_DIR = fileURLToPath(new URL("../dist/client/", import.meta.url));
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getContentType(pathname) {
  switch (extname(pathname)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function resolveStaticPath(pathname) {
  const normalizedPath = normalize(pathname)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const absolutePath = join(CLIENT_DIR, normalizedPath);

  if (!absolutePath.startsWith(CLIENT_DIR)) {
    return null;
  }

  return absolutePath;
}

async function tryServeStaticAsset(req, res, pathname) {
  if (
    pathname !== "/env-config.js" &&
    pathname !== "/favicon.svg" &&
    pathname !== "/og-default.svg" &&
    !pathname.startsWith("/assets/")
  ) {
    return false;
  }

  const filePath = resolveStaticPath(pathname);

  if (!filePath) {
    return false;
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return false;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", getContentType(filePath));
    res.setHeader("Content-Length", fileStat.size);

    if (req.method === "HEAD") {
      res.end();
      return true;
    }

    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function createRequest(req) {
  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader?.split(",")[0];
  const protocol = forwardedProto?.trim() || "http";
  const host = req.headers.host ?? `127.0.0.1:${PORT}`;
  const url = new URL(req.url ?? "/", `${protocol}://${host}`);

  return new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body: req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req),
    duplex: "half",
  });
}

function writeResponse(res, response) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });

  if (!response.body) {
    res.end();
    return;
  }

  Readable.fromWeb(response.body).pipe(res);
}

const server = createServer(async (req, res) => {
  const requestPathname = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? `127.0.0.1:${PORT}`}`,
  ).pathname;

  if ((await tryServeStaticAsset(req, res, requestPathname)) === true) {
    return;
  }

  try {
    const response = await app.fetch(createRequest(req));

    writeResponse(res, response);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SSR server listening on http://${HOST}:${PORT}`);
});
