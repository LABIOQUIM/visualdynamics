import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";

import pkg from "./package.json" with { type: "json" };

function envConfigPlugin(): Plugin {
  function sendEnvConfig(res: {
    setHeader: (name: string, value: string) => void;
    end: (body: string) => void;
  }) {
    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    res.setHeader("Content-Type", "application/javascript");
    res.end(`window.__ENV__ = { API_URL: "${apiUrl}" };`);
  }

  return {
    name: "env-config",
    configureServer(server) {
      server.middlewares.use("/env-config.js", (_req, res) => {
        sendEnvConfig(res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use("/env-config.js", (_req, res) => {
        sendEnvConfig(res);
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
    tanstackStart({
      spa: {
        enabled: false,
      },
    }),
    react(),
    envConfigPlugin(),
  ],
}));
