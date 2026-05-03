import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: [
      "dist/**",
      "node_modules/**",
      "src/**/*.integration.test.ts",
      "src/**/*.boundary.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.integration.test.ts",
        "src/**/*.boundary.test.ts",
        "src/generated/**",
        "src/main.ts",
        "src/app.module.ts",
        "src/test-utils/**",
      ],
    },
  },
});
