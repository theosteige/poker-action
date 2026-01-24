import { defineConfig, devices } from 'playwright/test'

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 60000,
  reporter: [['line']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
