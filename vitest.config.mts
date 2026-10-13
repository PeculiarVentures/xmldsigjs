import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.spec.ts', 'packages/*/test/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'text-summary'],
      include: ['packages/*/src/**/*.ts', '!packages/*/src/**/*.spec.ts'],
      exclude: ['**/*.d.ts'],
    },
  },
});
