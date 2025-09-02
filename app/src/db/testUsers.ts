"use server"

import { User, UserAddress, UserEmail, UserInteraction } from "@prisma/client"
import { requireTestMode, TestUser, createTestUser } from "@/lib/auth/testMode"
import { createUser, getUserByPrivyDid, updateUser } from "./users"

// Type for user with related data (matches the return type from getUserById/getUserByPrivyDid)
type UserWithRelations = User & {
  addresses: UserAddress[]
  interaction: UserInteraction | null
  emails: UserEmail[]
}

/**
 * Test User Database Management
 *
 * These functions provide utilities for managing test users in the database
 * during testing scenarios.
 */

/**
 * Create a test user in the database
 */
export const createTestUserInDB = async (
  testUser?: Partial<TestUser>,
): Promise<UserWithRelations> => {
  requireTestMode()

  const userData = createTestUser(testUser)

  // Check if user already exists
  const existingUser = await getUserByPrivyDid(userData.privyDid)
  if (existingUser) {
    return existingUser
  }

  // Create new test user
  const user = await createUser(userData.privyDid)

  // Update with additional test data if provided
  if (testUser && Object.keys(testUser).length > 0) {
    await updateUser({
      id: user.id,
      farcasterId: userData.farcasterId,
      name: userData.name,
      username: userData.name?.toLowerCase().replace(/\s+/g, ""),
      imageUrl: userData.imageUrl,
      bio: userData.bio,
      github: userData.github,
      discord: userData.discord,
    })
  }

  // Return the user with relations by fetching it again
  const userWithRelations = await getUserByPrivyDid(userData.privyDid)
  if (!userWithRelations) {
    throw new Error("Failed to create test user")
  }

  return userWithRelations
}

/**
 * Get or create a test user by ID
 */
export const getOrCreateTestUser = async (
  userId?: string,
): Promise<UserWithRelations> => {
  requireTestMode()

  const testUser = createTestUser({ id: userId })

  // Try to find existing user
  let user = await getUserByPrivyDid(testUser.privyDid)

  if (!user) {
    // Create new test user
    user = await createTestUserInDB(testUser)
  }

  return user
}

/**
 * Clean up test users from the database
 * This should be called after tests to maintain a clean state
 */
export const cleanupTestUsers = async (): Promise<void> => {
  requireTestMode()

  // In a real implementation, you might want to delete test users
  // For now, we'll just log that cleanup was called
  console.log("Test user cleanup called - test users preserved for debugging")
}

/**
 * Get a test user by Privy DID
 */
export const getTestUserByPrivyDid = async (
  privyDid: string,
): Promise<UserWithRelations | null> => {
  requireTestMode()

  // Only allow test Privy DIDs
  if (!privyDid.startsWith("test-privy-did-")) {
    throw new Error("Only test Privy DIDs are allowed in test mode")
  }

  return await getUserByPrivyDid(privyDid)
}

/**
 * Create multiple test users for testing scenarios
 */
export const createTestUsers = async (
  count: number = 3,
): Promise<UserWithRelations[]> => {
  requireTestMode()

  const users: UserWithRelations[] = []

  for (let i = 0; i < count; i++) {
    const testUser = createTestUser({
      name: `Test User ${i + 1}`,
      email: `testuser${i + 1}@example.com`,
      farcasterId: (1000 + i).toString(),
    })

    const user = await createTestUserInDB(testUser)
    users.push(user)
  }

  return users
}
