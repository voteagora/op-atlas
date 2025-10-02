/**
 * Test Mode Integration Tests
 *
 * These tests verify that the test mode functionality works correctly
 */

// Mock environment variables before importing the module
const mockEnv = {
  NODE_ENV: "development",
  ATLAS_TEST_MODE: undefined,
  USE_TEST_AUTH: undefined,
  MOCK_EXTERNAL_SERVICES: undefined,
}

// Mock process.env
Object.defineProperty(process, "env", {
  value: mockEnv,
  writable: true,
  configurable: true,
})

import {
  isTestMode,
  getTestModeConfig,
  getDefaultTestUser,
  getTestUser,
  createTestUser,
  requireTestMode,
} from "../testMode"

// Helper function to set environment variables
const setEnv = (key: string, value: string | undefined) => {
  ;(mockEnv as any)[key] = value
}

describe("Test Mode Configuration", () => {
  it("should detect test mode when NODE_ENV is test", () => {
    setEnv("NODE_ENV", "test")
    expect(isTestMode()).toBe(true)
  })

  it("should detect test mode when ATLAS_TEST_MODE is true", () => {
    setEnv("NODE_ENV", "development")
    setEnv("ATLAS_TEST_MODE", "true")
    expect(isTestMode()).toBe(true)
  })

  it("should detect test mode when USE_TEST_AUTH is true", () => {
    setEnv("NODE_ENV", "development")
    setEnv("USE_TEST_AUTH", "true")
    expect(isTestMode()).toBe(true)
  })

  it("should not be in test mode in production", () => {
    setEnv("NODE_ENV", "production")
    setEnv("ATLAS_TEST_MODE", undefined)
    setEnv("USE_TEST_AUTH", undefined)
    expect(isTestMode()).toBe(false)
  })
})

describe("Test Mode Functions", () => {
  beforeEach(() => {
    setEnv("NODE_ENV", "test")
  })

  it("should return correct test mode config", () => {
    const config = getTestModeConfig()
    expect(config.enabled).toBe(true)
    expect(config.defaultUser).toBeDefined()
    expect(config.mockExternalServices).toBe(true)
  })

  it("should return default test user", () => {
    const user = getDefaultTestUser()
    expect(user.id).toBe("test-user-123")
    expect(user.privyDid).toBe("test-privy-did-123")
    expect(user.farcasterId).toBe("12345")
    expect(user.name).toBe("Test User")
    expect(user.email).toBe("test@example.com")
  })

  it("should get test user by ID", () => {
    const user = getTestUser("custom-user-id")
    expect(user.id).toBe("custom-user-id")
    expect(user.privyDid).toBe("test-privy-did-custom-user-id")
    expect(user.farcasterId).toBe("custom-user-id")
  })

  it("should create test user with overrides", () => {
    const user = createTestUser({
      name: "Custom Test User",
      email: "custom@test.com",
    })
    expect(user.name).toBe("Custom Test User")
    expect(user.email).toBe("custom@test.com")
    // IDs now include a timestamp and random suffix for uniqueness
    expect(user.id).toMatch(/^test-user-/)
  })

  it("should require test mode for test functions", () => {
    setEnv("NODE_ENV", "production")
    expect(() => getTestUser()).toThrow(
      "getTestUser can only be called in test mode",
    )
    expect(() => createTestUser()).toThrow(
      "createTestUser can only be called in test mode",
    )
    expect(() => requireTestMode()).toThrow(
      "This function can only be called in test mode",
    )
  })
})
