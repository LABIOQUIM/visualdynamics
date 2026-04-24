import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";

import pkg from "./package.json" with { type: "json" };

function envConfigPlugin(): Plugin {
  return {
    name: "env-config",
    configureServer(server) {
      server.middlewares.use("/env-config.js", (_req, res) => {
        const apiUrl = process.env.API_URL ?? "http://localhost:3001";
        res.setHeader("Content-Type", "application/javascript");
        res.end(`window.__ENV__ = { API_URL: "${apiUrl}" };`);
      });
    },
  };
}

export default defineConfig(async () => ({
  server: {
    host: "0.0.0.0", // Expose to the network
    watch: {
      usePolling: true, // Force polling for file changes
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
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    envConfigPlugin(),
  ]
}));
