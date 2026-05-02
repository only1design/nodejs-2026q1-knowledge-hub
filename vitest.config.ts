import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['**/*.spec.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        branches: 85,
      },
    },
  },
});
