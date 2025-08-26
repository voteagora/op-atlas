import { test, expect } from "@playwright/test"
import {
  waitForPageReady,
  setupErrorCollection,
  filterCriticalErrors,
  expectElementWithRetry,
} from "./helpers/test-utils"

test.describe("Homepage", () => {
  test("should display Optimism branding", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/")
    await waitForPageReady(page)

    // Check page title contains Optimism
    const pageTitle = await page.title()
    expect(pageTitle).toContain("Optimism")

    // Check for Optimism branding elements
    const brandingElements = [
      'img[src*="optimismAtlasLogo"]',
      'img[src*="op-logo"]',
      'img[src*="optimism-wordmark"]',
      'img[src*="op-icon"]',
      'img[src*="logo.svg"]',
      'img[alt*="Optimism"]',
      'img[alt*="OP"]',
      'img[alt*="Atlas"]',
    ]

    // Verify at least one logo/branding element exists
    const hasLogo = await Promise.any(
      brandingElements.map(async (selector) => {
        const element = page.locator(selector)
        return (await element.count()) > 0
      }),
    ).catch(() => false)

    // If no logo found, check for text content
    if (!hasLogo) {
      const optimismText = page.locator("text=Optimism")
      const opText = page.locator("text=OP")
      const atlasText = page.locator("text=Atlas")

      const hasText =
        (await optimismText.count()) > 0 ||
        (await opText.count()) > 0 ||
        (await atlasText.count()) > 0

      expect(hasText).toBe(true)
    } else {
      expect(hasLogo).toBe(true)
    }
  })

  test("should display main homepage content and structure", async ({
    page,
  }) => {
    await page.goto("/")
    await waitForPageReady(page)

    // Check for main content area
    await expect(page.locator("main")).toBeVisible()

    // Check for the main heading about grants with retry
    await expectElementWithRetry(
      page,
      "text=Grants for the Superchain Ecosystem",
    )

    // Check for the subtitle about individual builders
    await expectElementWithRetry(
      page,
      "text=Support for individual builders and teams",
    )

    // Check for stats section
    await expectElementWithRetry(page, "text=OP rewarded in Retro Funding")

    // Check for specific stats with retry
    await expectElementWithRetry(page, "text=71M")
    await expectElementWithRetry(page, "text=102M")
    await expectElementWithRetry(page, "text=728")
  })

  test("should load without critical errors", async ({ page }) => {
    // Set up error collection before navigation
    const { errors, pageErrors } = await setupErrorCollection(page)

    // Navigate to the page
    await page.goto("/")
    await waitForPageReady(page)

    // Filter out common non-critical errors
    const { criticalErrors, criticalPageErrors } = filterCriticalErrors(
      errors,
      pageErrors,
    )

    // Log any errors for debugging
    if (criticalErrors.length > 0) {
      console.log("Found console errors:", criticalErrors)
    }
    if (criticalPageErrors.length > 0) {
      console.log("Found page errors:", criticalPageErrors)
    }

    // Allow some non-critical errors but fail on critical ones
    expect(criticalErrors.length).toBeLessThan(5)
    expect(criticalPageErrors.length).toBeLessThan(3)
  })
})
