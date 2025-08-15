import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should render the main header", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.waitForSelector("body", { state: "attached" })

    // Assert by stable header text rather than image selectors
    const header = page.getByText("Grants for the", { exact: false })
    await expect(header).toBeVisible()

    // Secondary smoke check: presence of supported chains section container
    await expect(page.locator("text=Projects rewarded")).toBeVisible()
  })
})