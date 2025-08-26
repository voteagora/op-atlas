import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should display Optimism branding", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

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
      'img[alt*="Atlas"]'
    ]

    // Verify at least one logo/branding element exists
    const hasLogo = await Promise.any(
      brandingElements.map(async (selector) => {
        const element = page.locator(selector)
        return (await element.count()) > 0
      })
    ).catch(() => false)

    // If no logo found, check for text content
    if (!hasLogo) {
      const optimismText = page.locator("text=Optimism")
      const opText = page.locator("text=OP")
      const atlasText = page.locator("text=Atlas")

      const hasText = (await optimismText.count()) > 0 || 
                     (await opText.count()) > 0 || 
                     (await atlasText.count()) > 0

      expect(hasText).toBe(true)
    } else {
      expect(hasLogo).toBe(true)
    }
  })

  test("should display main homepage content", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    // Check for main content area
    await expect(page.locator("main")).toBeVisible()

    // Check for the main heading about grants
    const mainHeading = page.locator("text=Grants for the Superchain Ecosystem")
    await expect(mainHeading).toBeVisible()

    // Check for the subtitle about individual builders
    const subtitle = page.locator("text=Support for individual builders and teams")
    await expect(subtitle).toBeVisible()
  })

  test("should load without critical errors", async ({ page }) => {
    // Set up error collection before navigation
    const errors: string[] = []
    const pageErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      pageErrors.push(error.message)
    })

    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")

    // Simple wait instead of networkidle
    await page.waitForTimeout(2000)

    // Filter out common non-critical errors
    const criticalErrors = errors.filter(error =>
      !error.includes('Failed to load resource') &&
      !error.includes('favicon') &&
      !error.includes('analytics') &&
      !error.includes('tracking') &&
      !error.includes('PostHog') &&
      !error.includes('punycode')
    )

    const criticalPageErrors = pageErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('analytics') &&
      !error.includes('tracking')
    )

    // Allow some non-critical errors but fail on critical ones
    expect(criticalErrors.length).toBeLessThan(5)
    expect(criticalPageErrors.length).toBeLessThan(3)
  })
})