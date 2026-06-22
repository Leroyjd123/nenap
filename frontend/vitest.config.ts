import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Frontend unit tests run in Node (pure logic + isomorphic utilities). DOM/component
// tests would need jsdom + testing-library; not pulled in yet.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
