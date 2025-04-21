import CredentialsProvider from "next-auth/providers/credentials"


import { getUserConnectedAddresses } from "@/lib/neynar"
import { PrivyUser } from "@/lib/types"
import { User } from "@prisma/client"
import { getAddress } from "viem"
import {
  addUserAddresses,
  getUserById,
  getUserByPrivyDid,
  updateUser,
  updateUserEmail,
  upsertUser
} from "../db/users"
import privy from "../lib/privy"

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

  },

  async authorize(credentials) {
    const { privyAccessToken, privy: privyUserObject } = credentials

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

    const privyUser = JSON.parse(privyUserObject as string)


    if (!privyUser.id) {
      console.log("privy id is required for authentication")
      return null
    }

    // Check if a user with this privyDid already exists
    const existingUser = await getUserByPrivyDid(privyUser.id)
    if (existingUser) {
      const refreshedUser = await syncPrivyUser(existingUser, privyUser)
      return userResponse(refreshedUser)
    } else {

      const newUser = await upsertUser({
        privyDid: privyUser.id,
      })

      const refreshedUser = await syncPrivyUser(newUser, privyUser)
      return userResponse(refreshedUser)
    }
  },
})

const userResponse = (user: any): UserResponse => ({
  id: user.id,
  farcasterId: user?.farcasterId as string | undefined,
  name: user?.name as string | undefined,
  image: user?.imageUrl as string | undefined,
  email: Array.isArray(user?.emails) && user.emails.length > 0 ? user.emails[0].email : undefined,
})


const syncPrivyUser = async (user: User, privyUser: PrivyUser) => {

  const existingUser = await getUserById(user.id)
  const existingAddresses = existingUser?.addresses?.map(addr => getAddress(addr.address)) || []

  if (privyUser.farcaster) {

    // Link farcaster to user
    await updateUser({
      id: user.id,
      farcasterId: privyUser.farcaster.fid.toString(),
      privyDid: privyUser.id,
      name: privyUser.farcaster.displayName || null,
      username: privyUser.farcaster.username || null,
      imageUrl: privyUser.farcaster.pfp || null,
      bio: privyUser.farcaster.bio || null,
    })

    const fcAddresses = await getUserConnectedAddresses(privyUser.farcaster.fid.toString())

    if (fcAddresses && fcAddresses.length > 0) {
      // Filter out addresses that already exist for the user
      const newFcAddresses = fcAddresses.filter(
        address => !existingAddresses.includes(getAddress(address))
      )

      if (newFcAddresses.length > 0) {
        for (const address of newFcAddresses) {
          try {
            await addUserAddresses({
              id: user.id,
              addresses: [getAddress(address)],
              source: "farcaster",
            })
          } catch (error) {
            console.error(`Failed to add Farcaster address ${address}: ${error}`)
          }
        }
      }
    }
  }

  // Add wallet address to user if it doesn't already exist
  if (privyUser.wallet?.address && privyUser.wallet.chainType === "ethereum") {
    const walletAddress = getAddress(privyUser.wallet.address)
    if (!existingAddresses.includes(walletAddress)) {
      try {
        await addUserAddresses({
          id: user.id,
          addresses: [getAddress(privyUser.wallet.address)],
          source: "privy",
        })
      } catch (error) {
        console.error("Failed to create user or add address:", error)
      }
    }
  }

  // Update the user's email if it exists
  if (privyUser?.email && privyUser.email.address) {
    await updateUserEmail({
      id: user.id,
      email: privyUser.email.address.toLowerCase(),
      verified: true,
    })
  }

  return await getUserById(user.id)
}
