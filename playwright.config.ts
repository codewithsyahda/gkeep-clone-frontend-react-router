import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const isCI = process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI ? 'blob' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  failOnFlakyTests: !!isCI,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['tests/e2e/screens/mobile/**'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['tests/e2e/screens/mobile/**'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: {
          slowMo: 500,
        },
      },
      testIgnore: ['tests/e2e/screens/mobile/**'],
      expect: {
        timeout: 60_000,
      },
      timeout: 120_000,
    },

    {
      name: 'Galaxy S9+',
      use: {
        ...devices['Galaxy S9+'],
        launchOptions: {
          slowMo: 300,
        },
      },
      testIgnore: ['tests/e2e/screens/desktop/**'],
      expect: {
        timeout: 30_000,
      },
      timeout: 60_000,
    },

    {
      name: 'Pixel 5',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          slowMo: 300,
        },
      },
      testIgnore: ['tests/e2e/screens/desktop/**'],
      expect: {
        timeout: 30_000,
      },
      timeout: 60_000,
    },

    {
      name: 'iPhone 12',
      use: {
        ...devices['iPhone 12'],
        launchOptions: {
          slowMo: 750,
        },
      },
      testIgnore: ['tests/e2e/screens/desktop/**'],
      expect: {
        timeout: 60_000,
      },
      timeout: 120_000,
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
  },
});
