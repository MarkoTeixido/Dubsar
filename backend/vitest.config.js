import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.config.js',
        'server.js',
      ],
    },
    setupFiles: ['./tests/setup/setup.js'],
    testTimeout: 10000,
  },
});