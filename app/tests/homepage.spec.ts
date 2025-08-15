import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should display Optimism branding", async ({ page }) => {
    // Navigate to homepage
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
}) 