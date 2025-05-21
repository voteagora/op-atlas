"use server"

import { Prisma } from "@prisma/client"
import { createPublicClient, http } from "viem"
import { getEnsAddress } from "viem/actions"
import { mainnet } from "viem/chains"

import { auth } from "@/auth"
import {
  searchByAddress,
  searchByEmail,
  searchUsersByUsername,
  updateUser,
  updateUserInteraction,
  getUserById,
  upsertUserPOH
} from "@/db/users"

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

async function resolveEnsName(name: string): Promise<string | null> {
  try {
    const address = await getEnsAddress(client, { name })
    return address
  } catch (error) {
    console.error("Error resolving ENS name:", error)
    return null
  }
}

export const setUserIsNotDeveloper = async (isNotDeveloper: boolean) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  let updated = await updateUser({
    id: session.user.id,
    notDeveloper: isNotDeveloper,
  })

  return {
    error: null,
    user: updated,
  }
}

export const updateGovForumProfileUrl = async (govForumProfileUrl: string) => {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  // Validate gov forum profile URL format
  if (
    !govForumProfileUrl.match(
      /^https:\/\/gov\.optimism\.io\/u\/[^\/]+\/summary$/,
    )
  ) {
    return {
      error:
        "Invalid URL format. Must be https://gov.optimism.io/u/yourname/summary",
    }
  }

  const updated = await updateUser({
    id: session.user.id,
    govForumProfileUrl,
  })

  return {
    error: null,
    user: updated,
  }
}

/**
 * Searches users by Farcaster username, address, email, or ENS name.
 * The query must be at least one character long.
 */
export const searchUsers = async (query: string) => {
  // Require authentication.
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  if (query.length < 1) {
    return {
      error: null,
      users: [],
    }
  }

  // Check if the query is an ENS name (ends with .eth)
  let searchQuery = query
  if (query.toLowerCase().endsWith('.eth')) {
    const resolvedAddress = await resolveEnsName(query)
    if (resolvedAddress) {
      searchQuery = resolvedAddress
    }
  }

  const [usernameResults, addressResults, emailResults] = await Promise.all([
    searchUsersByUsername({ username: searchQuery }),
    searchByAddress({ address: searchQuery }),
    searchByEmail({ email: searchQuery })
  ])

  // Combine results and remove duplicates based on user ID
  const uniqueUsers = Array.from(
    new Map([...usernameResults, ...addressResults, ...emailResults].map(user => [user.id, user])).values()
  )

  return {
    error: null,
    users: uniqueUsers,
  }
}

export const updateInteractions = async (
  data: Prisma.UserInteractionUncheckedCreateInput,
) => {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const userInteraction = await updateUserInteraction(session?.user?.id, {
    ...data,
    userId: session.user.id,
  })

  return {
    error: null,
    userInteraction,
  }
}

export const refreshUserPassport = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  const user = await getUserById(userId)

  if (!user) {
    return {
      error: "User not found",
    }
  }

  const primaryAddress = user.addresses.find(addr => addr.primary)

  if (!primaryAddress) {
    return {
      error: "Primary address is required",
    }
  }

  const apiKey = process.env.PASSPORT_API_KEY
  const scorerId = process.env.PASSPORT_SCORER_ID

  if (!apiKey || !scorerId) {
    return {
      error: "Passport API configuration is missing",
    }
  }

  try {
    const response = await fetch(
      `https://api.passport.xyz/v2/stamps/${scorerId}/score/${primaryAddress.address}`,
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        error: `Passport API error: ${error}`,
      }
    }

    const data = await response.json()

    // Store the Passport verification data
    await upsertUserPOH({
      userId,
      verification: {
        source: 'passport',
        sourceId: primaryAddress.address,
        expiresAt: new Date(data.expiration_timestamp),
        sourceMeta: data,
      },
    })

    return {
      error: null,
      data,
    }
  } catch (error) {
    console.error('Error fetching Passport score:', error)
    return {
      error: "Internal server error",
    }
  }
}

