import { User as PrivyUser } from "@privy-io/react-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { syncPrivyUser } from "../db/privy"
import { createUser, getUserByPrivyDid } from "../db/users"
import { getOrCreateTestUser } from "../db/testUsers"
import privy from "../lib/privy"
import {
  isTestMode,
  getTestUser,
  getMockPrivyCredentials,
} from "../lib/auth/testMode"
interface UserResponse {
  id: string
  farcasterId?: string
  name?: string
  image?: string
  email?: string
  privyDid?: string
}

export const PrivyCredentialsProvider = CredentialsProvider({
  name: "prviy",
  credentials: {
    privy: { label: "privy", type: "text" },
    privyAccessToken: { label: "privyAccessToken", type: "text" },
    testMode: { label: "testMode", type: "text" },
    testUserId: { label: "testUserId", type: "text" },
  },

  async authorize(credentials) {
    const {
      privyAccessToken,
      privy: privyUserObject,
      testMode,
      testUserId,
    } = credentials

    // Check if we're in test mode OR if testMode is explicitly set to 'true'
    if ((isTestMode() || testMode === "true") && testMode === "true") {
      try {
        // Get or create test user
        const testUser = await getOrCreateTestUser(testUserId as string)
        return userResponse(testUser)
      } catch (error) {
        console.error("Test mode authentication failed:", error)
        return null
      }
    }

    // Original Privy authentication flow
    try {
      const verified = await privy.verifyAuthToken(privyAccessToken as string)

      // TODO: Check whether futher token validation is needed

      // appId	string	Your Privy app ID.
      // userId	string	The authenticated user's Privy DID. Use this to identify the requesting user.
      // issuer	string	This will always be 'privy.io'.
      // issuedAt	string	Timestamp for when the access token was signed by Privy.
      // expiration	string	Timestamp for when the access token will expire.
      // sessionId	string	Unique identifier for the user's session.
    } catch (error) {
      console.log(`Token verification failed with error ${error}.`)
      return null
    }

    const privyUser = JSON.parse(privyUserObject as string) as PrivyUser

    if (!privyUser.id) {
      console.log("privy id is required for authentication")
      return null
    }

    // Check if a user with this privyDid already exists
    const existingUser = await getUserByPrivyDid(privyUser.id)

    if (!existingUser) {
      await createUser(privyUser.id)
    }

    const refreshedUser = await syncPrivyUser(privyUser)
    return userResponse(refreshedUser)
  },
})

const userResponse = (user: any): UserResponse => ({
  id: user.id,
  farcasterId: user?.farcasterId as string | undefined,
  name: user?.name as string | undefined,
  image: user?.imageUrl as string | undefined,
  email:
    Array.isArray(user?.emails) && user.emails.length > 0
      ? user.emails[0].email
      : undefined,
})
