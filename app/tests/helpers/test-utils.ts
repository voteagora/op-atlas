import { Page, expect } from "@playwright/test"

export async function waitForPageReady(page: Page) {
  // Wait for DOM to be ready
  await page.waitForLoadState("domcontentloaded")

  // Wait for network to be idle (but with a reasonable timeout)
  try {
    await page.waitForLoadState("networkidle", { timeout: 10000 })
  } catch (error) {
    // If networkidle times out, that's okay - just wait a bit more
    await page.waitForTimeout(1000)
  }

  // Additional wait for any dynamic content
  await page.waitForTimeout(500)
}

export async function setupErrorCollection(page: Page) {
  const errors: string[] = []
  const pageErrors: string[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text())
    }
  })

  page.on("pageerror", (error) => {
    pageErrors.push(error.message)
  })

  return { errors, pageErrors }
}

export function filterCriticalErrors(errors: string[], pageErrors: string[]) {
  const criticalErrors = errors.filter(
    (error) =>
      !error.includes("Failed to load resource") &&
      !error.includes("favicon") &&
      !error.includes("analytics") &&
      !error.includes("tracking") &&
      !error.includes("chrome-extension") &&
      !error.includes("moz-extension") &&
      !error.includes("safari-extension") &&
      !error.includes("ResizeObserver") &&
      !error.includes("requestAnimationFrame"),
  )

  const criticalPageErrors = pageErrors.filter(
    (error) =>
      !error.includes("favicon") &&
      !error.includes("analytics") &&
      !error.includes("tracking") &&
      !error.includes("ResizeObserver"),
  )

  return { criticalErrors, criticalPageErrors }
}

export async function expectElementWithRetry(
  page: Page,
  selector: string,
  options: { timeout?: number; retries?: number } = {},
) {
  const { timeout = 10000, retries = 3 } = options

  for (let i = 0; i < retries; i++) {
    try {
      const element = page.locator(selector)
      await expect(element).toBeVisible({ timeout })
      return element
    } catch (error) {
      if (i === retries - 1) throw error
      await page.waitForTimeout(1000)
    }
  }
}
