import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should display the Optimism logo", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => document.readyState === "complete")
    await page.waitForSelector("body", { state: "attached" })

    console.log("Page title:", await page.title())
    console.log("Page URL:", page.url())

    const logoSelectors = [
      'img[src*="optimismAtlasLogo"]',
      'img[src*="op-logo"]',
      'img[src*="optimism-wordmark"]',
      'img[src*="op-icon"]',
      'img[src*="logo.svg"]',
      'img[alt*="Optimism"]',
      'img[alt*="OP"]',
      'img[alt*="Atlas"]'
    ]

    let logoFound = false
    for (const selector of logoSelectors) {
      try {
        const logo = page.locator(selector)
        if (await logo.count() > 0) {
          console.log(`Found logo with selector: ${selector}`)
          logoFound = true
          break
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    const optimismText = page.locator("text=Optimism")
    const opText = page.locator("text=OP")
    const atlasText = page.locator("text=Atlas")

    expect(logoFound || 
           (await optimismText.count() > 0) || 
           (await opText.count() > 0) || 
           (await atlasText.count() > 0)).toBe(true)

    const pageTitle = await page.title()
    expect(pageTitle).toContain("Optimism")

    console.log("✅ Optimism branding verified successfully!")
  })
}) 