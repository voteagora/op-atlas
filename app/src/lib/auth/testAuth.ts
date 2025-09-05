/**
 * Test Authentication Helper
 *
 * This module provides utilities for authenticating test users
 * in test mode scenarios.
 */

import { signIn } from "next-auth/react"
import { isTestMode, requireTestMode } from "./testMode"

/**
 * Authenticate a test user in test mode
 */
export const authenticateTestUser = async (
  testUserId?: string,
): Promise<void> => {
  requireTestMode()

  try {
    await signIn("credentials", {
      testMode: "true",
      testUserId: testUserId || "test-user-123",
      redirect: false,
    })

    console.log(`✅ Test user authenticated: ${testUserId || "default"}`)
  } catch (error) {
    console.error("❌ Test authentication failed:", error)
    throw error
  }
}

/**
 * Authenticate the default test user
 */
export const authenticateDefaultTestUser = async (): Promise<void> => {
  return authenticateTestUser()
}

/**
 * Check if we can use test authentication
 */
export const canUseTestAuth = (): boolean => {
  return isTestMode()
}

/**
 * Get test authentication credentials
 */
export const getTestAuthCredentials = (testUserId?: string) => {
  requireTestMode()

  return {
    testMode: "true",
    testUserId: testUserId || "test-user-123",
  }
}
