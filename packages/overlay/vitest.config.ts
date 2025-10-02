import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [['src/core/viewport.test.ts', 'jsdom']],
    coverage: {
      provider: 'v8',
    },
    include: ['src/**/*.test.ts'],
  },
});
