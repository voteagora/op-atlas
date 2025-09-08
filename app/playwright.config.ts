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
    command: "pnpm graphql:generate && npx prisma generate && next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 240000 : 120000, // 4 minutes for CI, 2 for local
    env: {
      NODE_ENV: "test",
      ATLAS_TEST_MODE: "true",
      USE_TEST_AUTH: "true",
      MOCK_EXTERNAL_SERVICES: "true",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/atlas_test",
      NEXT_PUBLIC_PRIVY_APP_ID: "test-app-id",
      NEXT_PUBLIC_ATLAS_TEST_MODE: "true",
      NEXT_PUBLIC_USE_TEST_AUTH: "true",
      PRIVY_APP_ID: "test-app-id",
      PRIVY_APP_SECRET: "test-app-secret",
      NEXTAUTH_SECRET: "test-nextauth-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_AGORA_API_URL: "http://localhost:3000/api/mock",
      NEXT_PUBLIC_VERCEL_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_DOMAIN: "localhost:3000",
      NEXT_PUBLIC_VERCEL_ENV: "development",
      NEXT_PUBLIC_APPLICATIONS_CLOSED: "false",
      MAILCHIMP_API_KEY: "test-mailchimp-key",
      MAILCHIMP_SERVER_PREFIX: "test",
      NEXT_PUBLIC_MIXPANEL_TOKEN: "test-mixpanel-token",
      NEXT_PUBLIC_POSTHOG_KEY: "test-posthog-key",
      NEXT_PUBLIC_SAFE_API_KEY: "test-safe-api-key",
      NEXT_PUBLIC_ENV: "development",
      NEXT_PUBLIC_WORLD_APP_ID: "test-world-app-id",
      NEXT_PUBLIC_WORLD_APP_ACTION: "test-action",
    },
  },
})
