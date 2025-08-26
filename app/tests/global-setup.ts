import { chromium, FullConfig } from "@playwright/test"

async function globalSetup(config: FullConfig) {
  // Only run in CI environment
  if (!process.env.CI) return

  console.log("🔧 Setting up CI environment for Playwright tests...")

  // Ensure required environment variables are set
  const requiredEnvVars = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "PRIVY_APP_ID",
    "PRIVY_APP_SECRET",
    "DATABASE_URL",
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Warning: ${envVar} is not set`)
    } else {
      console.log(`✅ ${envVar} is set`)
    }
  }

  // Test if the server is accessible
  try {
    const browser = await chromium.launch()
    const page = await browser.newPage()

    console.log("🌐 Testing server connectivity...")

    // Try to connect to the server with a short timeout
    await page.goto("http://localhost:3000", {
      timeout: 10000,
      waitUntil: "domcontentloaded",
    })

    console.log("✅ Server is accessible")
    await browser.close()
  } catch (error) {
    console.error("❌ Server connectivity test failed:", error)
    // Don't throw here - let the tests handle it
  }

  console.log("🚀 CI environment setup complete")
}

export default globalSetup
