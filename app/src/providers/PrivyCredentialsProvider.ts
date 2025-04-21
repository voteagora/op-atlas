import CredentialsProvider from "next-auth/providers/credentials"

import { getUserConnectedAddresses } from "@/lib/neynar"

import { getAddress } from "viem"
import {
  addUserAddresses,
  getUserByAddress,
  getUserByEmail,
  getUserByFarcasterId,
  getUserById,
  getUserByPrivyDid,
  updateUser,
  updateUserEmail,
  upsertUser,
} from "../db/users"
import privy from "../lib/privy"
import { User } from "@prisma/client"

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
    privyDid: { label: "privyDid", type: "text" },
    email: { label: "address", type: "text" },
    wallet: { label: "wallet", type: "text" },
    token: { label: "token", type: "text" },
    farcaster: { label: "farcaster", type: "text" },
  },

  async authorize(credentials) {
    const { wallet, token, email, farcaster, privyDid } = credentials

    try {
      const verified = await privy.verifyAuthToken(token as string)

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

    if (!privyDid) {
      console.log("privyDid is required for authentication")
      return null
    }

    // Check if a user with this privyDid already exists
    const existingUser = await getUserByPrivyDid(privyDid as string)
    if (existingUser) {
      return userResponse(existingUser)
    }

    if (farcaster && farcaster !== "undefined") {
      return loginWithFarcaster(farcaster as string, privyDid as string)
    }

    if (wallet && wallet !== "undefined") {
      return loginWithWallet(wallet as string, privyDid as string)
    }

    if (email && email !== "undefined") {
      return loginWithEmail(email as string, privyDid as string)
    }
    return null
  },
})

const userResponse = (user: any): UserResponse => ({
  id: user.id,
  farcasterId: user?.farcasterId as string | undefined,
  name: user?.name as string | undefined,
  image: user?.imageUrl as string | undefined,
  email: Array.isArray(user?.emails) && user.emails.length > 0 ? user.emails[0].email : undefined,
})

const loginWithEmail = async (email: string, privyDid: string): Promise<UserResponse | null> => {

  const user = await getUserByEmail(email.toLowerCase())
  if (user) {
    // Update the existing user with privyDid if not set
    if (!privyDid) {
      await updateUser({
        id: user.id,
        privyDid,
      })

      // Get updated user data with privyDid
      const updatedUser = await getUserById(user.id)
      if (updatedUser) {
        return userResponse(updatedUser)
      }
    }

    await updateUserEmail({
      id: user.id,
      email: email.toLowerCase(),
      verified: true,
    })

    return userResponse(user)
  }

  try {
    const newUser = await upsertUser({
      privyDid
    })
    await updateUserEmail({
      id: newUser.id,
      email: email.toLowerCase(),
      verified: true,
    })

    // Refetch the user to get updated email data
    const updatedUser = await getUserById(newUser.id)
    return userResponse(updatedUser)
  } catch (error) {
    console.error("Failed to create user or update email:", error)
    return null
  }
}

const loginWithWallet = async (
  wallet: string,
  privyDid: string
): Promise<UserResponse | null> => {
  const checksumAddress = getAddress(wallet)
  const user = await getUserByAddress(checksumAddress)

  if (user) {
    // Update the existing user with privyDid if not set
    if (!(user as any).privyDid) {
      await updateUser({
        id: user.id,
        privyDid,
      })

      // Get updated user data with privyDid
      const updatedUser = await getUserById(user.id)
      if (updatedUser) {
        return userResponse(updatedUser)
      }
    }

    return userResponse(user)
  }

  try {
    const newUser = await upsertUser({
      privyDid
    })

    await addUserAddresses({
      id: newUser.id,
      addresses: [checksumAddress],
      source: "privy",
    })
    return userResponse(newUser)
  } catch (error) {
    console.error("Failed to create user or add address:", error)
    return null
  }
}

const loginWithFarcaster = async (
  farcaster: string,
  privyDid: string
): Promise<UserResponse | null> => {
  try {
    const { fid, pfp, displayName, username, bio } = JSON.parse(farcaster)

    if (!fid) {
      console.error("Farcaster ID is required")
      return null
    }

    const farcasterId = fid.toString()

    // Check for direct fid match first
    const user = await getUserByFarcasterId(farcasterId)
    if (user) {
      // Update the existing user with privyDid if not set
      if (!(user as any).privyDid) {
        await updateUser({
          id: user.id,
          farcasterId,
          privyDid,
          name: displayName || user.name,
          username: username || user.username,
          imageUrl: pfp || user.imageUrl,
          bio: bio || user.bio,
        })

        // Get updated user data with privyDid
        const updatedUser = await getUserById(user.id)
        if (updatedUser) {
          return userResponse(updatedUser)
        }
      }

      return userResponse(user)
    }

    // Check for Farcaster wallets and match them to existing users
    const connectedAddresses = await getUserConnectedAddresses(farcasterId)

    if (connectedAddresses && connectedAddresses.length > 0) {
      for (const address of connectedAddresses) {
        const user = await getUserByAddress(getAddress(address))
        if (user) {
          // Update the existing user with Farcaster information
          const updatedUser = await updateUser({
            id: user.id,
            farcasterId,
            privyDid,
            name: displayName || null,
            username: username || null,
            imageUrl: pfp || null,
            bio: bio || null,
          })

          // Add the missing addresses to the user
          const missingAddresses = connectedAddresses
            .filter((addr) => getAddress(addr) !== getAddress(address))
            .map((addr) => getAddress(addr))

          if (missingAddresses.length > 0) {
            await addUserAddresses({
              id: user.id,
              addresses: missingAddresses,
              source: "farcaster",
            })
          }

          return userResponse(updatedUser)
        }
      }
    }

    // We have a brand new user
    const newUser = await upsertUser({
      farcasterId,
      privyDid,
      name: displayName || null,
      username: username || null,
      imageUrl: pfp || null,
      bio: bio || null,
    })

    return userResponse(newUser)
  } catch (error) {
    console.error("Failed to create user or add address:", error)
    return null
  }
}


const syncPrivyUser = async (user: User) => {

}
