import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: process.env.CI ? 60000 : 30000, // Longer timeout for CI
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
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
    env: {
      NODE_ENV: "test",
      ATLAS_TEST_MODE: "true",
      USE_TEST_AUTH: "true",
      MOCK_EXTERNAL_SERVICES: "true",
      NEXT_PUBLIC_PRIVY_APP_ID: "test-app-id",
      NEXT_PUBLIC_ATLAS_TEST_MODE: "true",
      NEXT_PUBLIC_USE_TEST_AUTH: "true",
      PRIVY_APP_ID: "test-app-id",
      PRIVY_APP_SECRET: "test-app-secret",
      NEXTAUTH_SECRET: "test-nextauth-secret",
      NEXTAUTH_URL: "http://localhost:3000",
    },
  },
})
