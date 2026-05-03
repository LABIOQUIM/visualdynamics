import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./src/test-utils/setup.ts"],
    include: ["src/**/*.integration.test.ts", "src/**/*.boundary.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    passWithNoTests: true,
  },
});
