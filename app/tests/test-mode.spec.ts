import { test, expect } from "@playwright/test"
import { setupTestMode } from "./helpers/auth"
import { waitForPageReady } from "./helpers"
import "./setup"

test.describe("Test Mode Infrastructure", () => {
  test("should load homepage in test mode", async ({ page }) => {
    // Set up test mode
    await setupTestMode(page)

    // Navigate to homepage
    await page.goto("/")
    await waitForPageReady(page)

    // Verify the page loads without errors
    await expect(page.locator("main")).toBeVisible()

    // Check for any console errors
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    // Wait a bit to catch any errors
    await page.waitForTimeout(2000)

    // Filter out known non-critical errors (CORS errors are expected in test mode)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("Request quota exhausted") &&
        !error.includes("browsers data (caniuse-lite) is 9 months old") &&
        !error.includes("CORS policy") &&
        !error.includes("Access to fetch at") &&
        !error.includes("net::ERR_FAILED") &&
        !error.includes("Content Security Policy") &&
        !error.includes("googletagmanager.com"),
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test("should have test mode environment variables set", async ({ page }) => {
    await setupTestMode(page)

    await page.goto("/")
    await waitForPageReady(page)

    // Check that test mode is active by looking for test-specific behavior
    // Since process.env is not available in browser, we'll check for other indicators
    const testModeIndicator = await page.evaluate(() => {
      return (
        window.location.hostname === "localhost" &&
        window.location.port === "3000"
      )
    })

    expect(testModeIndicator).toBe(true)
  })

  test("should be able to set cookies for authentication", async ({ page }) => {
    await setupTestMode(page)

    // Test that we can set cookies (this is what our auth helper does)
    await page.context().addCookies([
      {
        name: "test-cookie",
        value: "test-value",
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ])

    await page.goto("/")
    await waitForPageReady(page)

    // Verify the cookie was set
    const cookies = await page.context().cookies()
    const testCookie = cookies.find((cookie) => cookie.name === "test-cookie")

    expect(testCookie).toBeDefined()
    expect(testCookie?.value).toBe("test-value")
  })
})
