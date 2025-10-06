/**
 * Test Mode Configuration and Utilities
 *
 * This module provides utilities for running the application in test mode,
 * bypassing external services like Privy for testing purposes.
 */

export interface TestUser {
  id: string
  privyDid: string
  farcasterId?: string
  name?: string
  email?: string
  imageUrl?: string
  bio?: string
  github?: string
  discord?: string
  addresses?: string[]
}

export interface TestModeConfig {
  enabled: boolean
  defaultUser?: TestUser
  mockExternalServices: boolean
}

/**
 * Check if the application is running in test mode
 */
const isTrue = (v?: string) => v?.toLowerCase() === "true";

export const isTestMode = (): boolean => {
  return (
    process.env.NODE_ENV === "test" ||
    isTrue(process.env.ATLAS_TEST_MODE) ||
    isTrue(process.env.USE_TEST_AUTH) ||
    isTrue(process.env.NEXT_PUBLIC_ATLAS_TEST_MODE) ||
    isTrue(process.env.NEXT_PUBLIC_USE_TEST_AUTH)
  );
}

/**
 * Get test mode configuration
 */
export const getTestModeConfig = (): TestModeConfig => {
  const enabled = isTestMode()

  return {
    enabled,
    defaultUser: enabled ? getDefaultTestUser() : undefined,
    mockExternalServices:
      enabled && process.env.MOCK_EXTERNAL_SERVICES !== "false",
  }
}

/**
 * Get a default test user for testing purposes
 */
export const getDefaultTestUser = (): TestUser => {
  return {
    id: "test-user-123",
    privyDid: "test-privy-did-123",
    farcasterId: "12345",
    name: "Test User",
    email: "test@example.com",
    imageUrl: "https://example.com/test-avatar.png",
    bio: "Test user for automated testing",
    github: "testuser",
    discord: "testuser#1234",
    addresses: ["0x1234567890123456789012345678901234567890"],
  }
}

/**
 * Get a test user by ID or return the default test user
 */
export const getTestUser = (userId?: string): TestUser => {
  if (!isTestMode()) {
    // Allow in development mode when running on localhost (for Playwright tests)
    const isLocalhost =
      typeof window !== "undefined"
        ? window.location.hostname === "localhost"
        : process.env.NODE_ENV === "development"

    if (!isLocalhost) {
      throw new Error(
        "getTestUser can only be called in test mode or on localhost",
      )
    }
  }

  if (userId && userId !== "test-user-123") {
    // For now, return default user for any test user ID
    // In the future, we could maintain a registry of test users
    return {
      ...getDefaultTestUser(),
      id: userId,
      privyDid: `test-privy-did-${userId}`,
      farcasterId: userId,
    }
  }

  return getDefaultTestUser()
}

/**
 * Create a test user with custom properties
 */
export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => {
  if (!isTestMode()) {
    // Allow in development mode when running on localhost (for Playwright tests)
    const isLocalhost =
      typeof window !== "undefined"
        ? window.location.hostname === "localhost"
        : process.env.NODE_ENV === "development"

    if (!isLocalhost) {
      throw new Error(
        "createTestUser can only be called in test mode or on localhost",
      )
    }
  }

  // Use a more unique identifier to avoid collisions
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const uniqueId = `${timestamp}-${randomSuffix}`
  
  return {
    id: `test-user-${uniqueId}`,
    privyDid: `test-privy-did-${uniqueId}`,
    farcasterId: uniqueId,
    name: "Test User",
    email: `test-${uniqueId}@example.com`,
    ...overrides,
  }
}

/**
 * Validate that we're in test mode before proceeding
 * Also allows localhost access for Playwright tests
 */
export const requireTestMode = (): void => {
  if (!isTestMode()) {
    // Allow in development mode when running on localhost (for Playwright tests)
    const isLocalhost =
      typeof window !== "undefined"
        ? window.location.hostname === "localhost"
        : process.env.NODE_ENV === "development"

    if (!isLocalhost) {
      throw new Error(
        "This function can only be called in test mode or on localhost",
      )
    }
  }
}

/**
 * Get mock Privy credentials for testing
 */
export const getMockPrivyCredentials = () => {
  requireTestMode()

  return {
    appId: "test-app-id",
    appSecret: "test-app-secret",
    accessToken: "test-access-token",
  }
}
