import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
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
