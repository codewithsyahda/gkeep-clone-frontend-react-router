/// <reference types="vitest/config" />
import { reactRouter } from '@react-router/dev/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import viteReactPlugin from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isRR7 = process.env.IS_RR7 === 'true';
const isCI = process.env.CI === 'true';

export default defineConfig({
  plugins: [
    tailwindcss(),
    isRR7 ? reactRouter() : viteReactPlugin(),
    tsconfigPaths(),
  ],
  test: {
    coverage: {
      exclude: [
        '**/*.tsx',
        'app/**/*hooks/**/*.ts',
        'app/tests/mocks/**/*.ts',
        '.storybook/**/*.ts',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/app/**/*.{test,spec}.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['**/app/**/*.{test,spec}.tsx'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.resolve(import.meta.dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          maxWorkers: isCI ? 1 : undefined,
          fileParallelism: !isCI,
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
