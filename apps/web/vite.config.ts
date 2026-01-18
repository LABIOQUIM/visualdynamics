import postcss from "postcss";

import preact from "@preact/preset-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
import postcssLoadConfig from "postcss-load-config";
import { defineConfig } from "vite";

import pkg from "./package.json" assert { type: "json" };

export default defineConfig(async () => {
  const { plugins: postcssPlugins } = await postcssLoadConfig();

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      global: "window",
      __VERSION__: `"${pkg.version}"`,
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      preact(),
      {
        name: "vite-pcss",
        enforce: "pre",
        async transform(code, id) {
          if (!id.endsWith(".pcss")) return null;

          const result = await postcss(postcssPlugins).process(code, {
            from: id,
          });

          return {
            code: `import ${JSON.stringify(id + ".css")};\n` + result.css,
            map: result.map ? result.map.toJSON() : null,
          };
        },
      },
    ],
  };
});
