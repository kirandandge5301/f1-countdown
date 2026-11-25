import path from 'path';
import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts: tests only need the "@" alias, not the dev plugins.
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
