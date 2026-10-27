import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["packages/*/src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "text-summary"],
      include: ["packages/*/src/**/*.ts", "!packages/*/src/**/*.spec.ts"],
      exclude: ["**/*.d.ts"],
    },
  },
});
