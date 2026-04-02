import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'api/src/**/*.spec.ts',
      'shared/src/**/*.spec.ts',
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['html'],
      reportsDirectory: 'coverage',
      include: [
        'api/src/**/*.ts',
        'shared/src/**/*.ts',
      ],
      exclude: [
        '**/*.spec.ts',
        '**/test-data-factory.ts',
        'shared/src/types/*',
        '**/dependencies/**/*.ts',
        '**/mongodb-schemas/**/*.ts',
        '**/node_modules/**',
        '**/*.index.ts',
        'api/src/handlers/index.handler.ts',
        'shared/src/services/*.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@household/api': 'api/src',
      '@household/shared': 'shared/src',
    },
  },
});
