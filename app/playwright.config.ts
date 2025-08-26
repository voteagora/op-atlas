import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: process.env.CI ? 60000 : 30000, // Longer timeout for CI
  expect: {
    timeout: process.env.CI ? 10000 : 5000, // Longer expect timeout for CI
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Add more stable viewport for CI
    viewport: { width: 1280, height: 720 },
    // Add action timeout for CI
    actionTimeout: process.env.CI ? 10000 : 5000,
    // Add navigation timeout for CI
    navigationTimeout: process.env.CI ? 30000 : 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180000 : 120000, // 3 minutes for CI, 2 for local
    // Add health check for CI
    ...(process.env.CI && {
      health: "http://localhost:3000",
      healthTimeout: 60000,
    }),
    // Add stdout/stderr capture for debugging
    stdout: "pipe",
    stderr: "pipe",
  },
  // Add global setup for CI environment
  globalSetup: process.env.CI ? "./tests/global-setup.ts" : undefined,
})
