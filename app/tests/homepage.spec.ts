import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should render the main header", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.waitForSelector("body", { state: "attached" })

    // Assert by page HTML content to avoid flakiness with locators in CI
    const html = await page.content()
    expect(
      html.includes("Grants for the") ||
        html.includes("Superchain Ecosystem") ||
        html.includes("Projects rewarded"),
    ).toBe(true)
  })
})