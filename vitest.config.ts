import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve xml-core/xmldsigjs imports to the package sources through the tsconfig paths.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["packages/*/src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["packages/*/src/**/*"],
      exclude: ["packages/*/src/**/*.spec.ts", "**/build/**"],
    },
  },
});
