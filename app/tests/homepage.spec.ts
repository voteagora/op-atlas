import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should load without server errors", async ({ page }) => {
    const res = await page.goto("/")
    // Basic server response is OK (status < 500)
    expect(res && res.status() < 500).toBe(true)

    await page.waitForLoadState("networkidle")
    await page.waitForSelector("html", { state: "attached" })
    await page.waitForSelector("body", { state: "attached" })

    const html = await page.content()
    // Sanity: page rendered some markup and not the Next error/404 pages
    expect(html.length > 0).toBe(true)
    expect(html.includes("This page could not be found")).toBe(false)
    expect(html.toLowerCase().includes("application error")).toBe(false)
  })
})