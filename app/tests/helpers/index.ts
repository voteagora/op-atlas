/**
 * Playwright Test Helpers
 *
 * General utilities for Playwright tests
 */

import { Page, expect } from "@playwright/test"

/**
 * Wait for the page to be fully loaded and ready
 */
export const waitForPageReady = async (page: Page): Promise<void> => {
  // Wait for DOM to be ready (less strict than networkidle)
  await page.waitForLoadState("domcontentloaded")

  // Wait a bit for any initial rendering
  await page.waitForTimeout(1000)

  // Wait for any loading spinners to disappear (if they exist)
  try {
    await page.waitForFunction(
      () => {
        const spinners = document.querySelectorAll(
          '[data-testid="loading"], .loading, .spinner',
        )
        return spinners.length === 0
      },
      { timeout: 5000 },
    )
  } catch {
    // If no spinners found, that's fine - continue
  }
}

/**
 * Take a screenshot with a descriptive name
 */
export const takeScreenshot = async (
  page: Page,
  name: string,
  fullPage: boolean = true,
): Promise<void> => {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage,
  })
}

/**
 * Wait for and click an element
 */
export const waitAndClick = async (
  page: Page,
  selector: string,
  timeout: number = 10000,
): Promise<void> => {
  await page.waitForSelector(selector, { timeout })
  await page.click(selector)
}

/**
 * Wait for and fill an input
 */
export const waitAndFill = async (
  page: Page,
  selector: string,
  value: string,
  timeout: number = 10000,
): Promise<void> => {
  await page.waitForSelector(selector, { timeout })
  await page.fill(selector, value)
}

/**
 * Wait for text to appear on the page
 */
export const waitForText = async (
  page: Page,
  text: string,
  timeout: number = 10000,
): Promise<void> => {
  await page.waitForSelector(`text=${text}`, { timeout })
}

/**
 * Check if an element is visible
 */
export const isVisible = async (
  page: Page,
  selector: string,
): Promise<boolean> => {
  try {
    await page.waitForSelector(selector, { timeout: 1000 })
    return await page.isVisible(selector)
  } catch {
    return false
  }
}

/**
 * Wait for navigation to complete
 */
export const waitForNavigation = async (page: Page): Promise<void> => {
  await page.waitForLoadState("networkidle")
  await page.waitForLoadState("domcontentloaded")
}

/**
 * Get the current URL path
 */
export const getCurrentPath = async (page: Page): Promise<string> => {
  return new URL(page.url()).pathname
}

/**
 * Check if we're on a specific page
 */
export const isOnPage = async (page: Page, path: string): Promise<boolean> => {
  const currentPath = await getCurrentPath(page)
  return currentPath === path
}

/**
 * Navigate to a page and wait for it to load
 */
export const navigateTo = async (page: Page, path: string): Promise<void> => {
  await page.goto(path)
  await waitForPageReady(page)
}

/**
 * Wait for a specific element to be visible and then take a screenshot
 */
export const waitAndScreenshot = async (
  page: Page,
  selector: string,
  screenshotName: string,
): Promise<void> => {
  await page.waitForSelector(selector)
  await takeScreenshot(page, screenshotName)
}

/**
 * Check for console errors
 */
export const checkForConsoleErrors = async (page: Page): Promise<string[]> => {
  const errors: string[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text())
    }
  })

  return errors
}

/**
 * Wait for a specific number of elements
 */
export const waitForElementCount = async (
  page: Page,
  selector: string,
  count: number,
  timeout: number = 10000,
): Promise<void> => {
  await page.waitForFunction(
    ({ selector, count }) => {
      return document.querySelectorAll(selector).length === count
    },
    { selector, count },
    { timeout },
  )
}
