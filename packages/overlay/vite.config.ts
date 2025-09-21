import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(rootDir, 'src/index.ts'),
      name: 'BreakpointOverlay',
      fileName: (format) => {
        if (format === 'es') return 'index.es.js';
        if (format === 'iife') return 'index.iife.js';
        return 'index.cjs';
      },
      formats: ['es', 'cjs', 'iife'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
});
