import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { STORAGE_STATE } from './src/config/paths';

const isCI = !!process.env.CI;

/**
 * Projects:
 *  - setup          logs in once and saves the session to STORAGE_STATE
 *  - chromium, firefox, webkit, mobile-chrome
 *                   UI suite, cross-browser and on a mobile viewport, reusing the saved session
 *  - api            REST API suite, no browser required
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: 'test-results',
  reporter: isCI
    ? [
        ['list'],
        ['github'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    // Sauce Demo exposes stable `data-test` attributes; getByTestId() targets them.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: env.BASE_URL },
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: env.BASE_URL, storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], baseURL: env.BASE_URL, storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], baseURL: env.BASE_URL, storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      use: { ...devices['Pixel 7'], baseURL: env.BASE_URL, storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.API_BASE_URL,
        // Ask for JSON explicitly; Restful Booker can also respond in XML or URL-encoded form.
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
