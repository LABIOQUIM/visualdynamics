import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET ?? "http://localhost:2000",
        changeOrigin: true,
        rewrite: (requestPath: string) => requestPath.replace(/^\/api/, ""),
      },
    },
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "window",
    __VERSION__: `"${pkg.version}"`,
  },
  plugins: [tanstackRouter(), react()],
});
