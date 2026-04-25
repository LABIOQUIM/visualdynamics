#!/usr/bin/env node
// Normalises relative imports in Prisma-generated TypeScript files to use .js extensions.
// Prisma 7 generates bare imports (no extension) or .ts extensions depending on package type.
// Neither works with NodeNext/ESM at runtime — Node.js needs explicit .js.
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const generatedDir = new URL("../src/generated/prisma", import.meta.url).pathname;

function processFile(filePath) {
  let content = readFileSync(filePath, "utf8");
  // .ts extensions → .js
  content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+?)\.ts(['"])/g, "$1$2.js$3");
  // bare relative imports (no extension) → add .js
  content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g, (match, prefix, path, quote) => {
    if (/\.[a-z]{1,4}$/.test(path)) return match;
    return `${prefix}${path}.js${quote}`;
  });
  writeFileSync(filePath, content);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith(".ts")) {
      processFile(full);
    }
  }
}

walk(generatedDir);
console.log("Prisma imports normalised to .js");
