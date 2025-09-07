import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 180_000,
  expect: { timeout: 60_000 },
  retries: 1,
  workers: 1,
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
