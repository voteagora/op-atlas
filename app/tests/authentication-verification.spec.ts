import { test, expect } from "@playwright/test"
import { setupTestMode, authenticateTestUser } from "./helpers/auth"
import { waitForPageReady } from "./helpers"
import "./setup"

test.describe("Authentication Verification", () => {
  test("should show Sign in button when user is not authenticated", async ({
    page,
  }) => {
    // Don't authenticate - stay unauthenticated
    await setupTestMode(page)

    // Navigate to homepage
    await page.goto("/")
    await waitForPageReady(page)

    // Should see the red "Sign in" button in the top right corner
    const signInButton = page.locator('button:has-text("Sign in")')
    await expect(signInButton).toBeVisible()
  })

  test("should hide Sign in button when user is authenticated", async ({
    page,
  }) => {
    // TODO: Fix authentication API 403 error
    // Authenticate as test user
    await setupTestMode(page)
    await authenticateTestUser(page)

    // Navigate to homepage
    await page.goto("/")
    await waitForPageReady(page)

    // Should NOT see the "Sign in" button (it should be replaced with user profile)
    const signInButton = page.locator('button:has-text("Sign in")')
    await expect(signInButton).not.toBeVisible()
  })
})
