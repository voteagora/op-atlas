/**
 * Playwright Test Authentication Helpers
 *
 * These helpers make it easy to authenticate test users in Playwright tests
 */

import { Page } from "@playwright/test"

/**
 * Set up test mode environment for a page
 */
export const setupTestMode = async (page: Page): Promise<void> => {
  // Environment variables are already injected from workflow + playwright.config.ts
  // No need to set them again in the browser context
}

/**
 * Authenticate as a test user using the test auth API
 * This creates a proper NextAuth session in test mode
 */
export const authenticateTestUser = async (
  page: Page,
  testUserId: string = "test-user-123",
): Promise<void> => {
  // First set up test mode
  await setupTestMode(page)

  // Call our test auth API to create a proper session
  const response = await page.request.post("/api/test-auth", {
    data: { userId: testUserId },
  })

  if (!response.ok()) {
    const errorText = await response.text()
    throw new Error(
      `Test authentication failed: ${response.status()} - ${errorText}`,
    )
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(`Test authentication failed: ${result.error}`)
  }

  // Navigate to a page to establish the session in the browser
  await page.goto("/")
  await page.waitForLoadState("domcontentloaded")
}

/**
 * Authenticate as the default test user
 */
export const authenticateDefaultTestUser = async (
  page: Page,
): Promise<void> => {
  return authenticateTestUser(page, "test-user-123")
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (page: Page): Promise<boolean> => {
  try {
    // Check if we can access a protected route
    const response = await page.goto("/dashboard", {
      waitUntil: "domcontentloaded",
    })
    return response?.status() !== 401 && response?.status() !== 403
  } catch {
    return false
  }
}

/**
 * Logout the current user
 */
export const logout = async (page: Page): Promise<void> => {
  await page.goto("/api/auth/signout")
  await page.waitForLoadState("domcontentloaded")
}

/**
 * Create a test user with specific data
 */
export const createTestUser = async (
  page: Page,
  userData: {
    id?: string
    name?: string
    email?: string
    farcasterId?: string
  } = {},
): Promise<string> => {
  await setupTestMode(page)

  const testUserId = userData.id || `test-user-${Date.now()}`

  // Store test user data in localStorage for the test
  await page.evaluate(
    (data) => {
      localStorage.setItem("testUserData", JSON.stringify(data))
    },
    { ...userData, id: testUserId },
  )

  return testUserId
}
