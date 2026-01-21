"use server"

import { Prisma } from "@prisma/client"
import { createPublicClient, http } from "viem"
import { getEnsAddress } from "viem/actions"
import { mainnet } from "viem/chains"

import {
  deleteUserPassport,
  getUserById,
  getUserPassports,
  searchByAddress,
  searchByEmail,
  searchUsersByUsername,
  updateUser,
  updateUserInteraction,
  upsertUserPassport,
} from "@/db/users"
import { withImpersonation } from "@/lib/db/sessionContext"
import { withImpersonationProtection } from "@/lib/impersonationContext"

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

export const setUserIsNotDeveloper = async (isNotDeveloper: boolean) =>
  withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return {
        error: "Unauthorized",
      }
    }

    const updated = await updateUser(
      {
        id: userId,
        notDeveloper: isNotDeveloper,
      },
      db,
    )

    return {
      error: null,
      user: updated,
    }
  })

export const updateGovForumProfileUrl = async (govForumProfileUrl: string) =>
  withImpersonation(async ({ db, userId }) => {
    if (!userId) {
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

    const updated = await updateUser(
      {
        id: userId,
        govForumProfileUrl,
      },
      db,
    )

    return {
      error: null,
      user: updated,
    }
  })

export const clearGovForumProfileUrl = async () =>
  withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return {
        error: "Unauthorized",
      }
    }

    const updated = await updateUser(
      {
        id: userId,
        govForumProfileUrl: null,
      },
      db,
    )

    return {
      error: null,
      user: updated,
    }
  })

/**
 * Searches users by Farcaster username, address, email, or ENS name.
 * The query must be at least one character long.
 */
export const searchUsers = async (query: string) =>
  withImpersonation(async ({ db, userId }) => {
    if (!userId) {
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
    if (query.toLowerCase().endsWith(".eth")) {
      const resolvedAddress = await resolveEnsName(query)
      if (resolvedAddress) {
        searchQuery = resolvedAddress
      }
    }

    const [usernameResults, addressResults, emailResults] = await Promise.all([
      searchUsersByUsername({ username: searchQuery }, db),
      searchByAddress({ address: searchQuery }, db),
      searchByEmail({ email: searchQuery }, db),
    ])

    // Combine results and remove duplicates based on user ID
    const uniqueUsers = Array.from(
      new Map(
        [...usernameResults, ...addressResults, ...emailResults].map((user) => [
          user.id,
          user,
        ]),
      ).values(),
    )

    return {
      error: null,
      users: uniqueUsers,
    }
  })

export const updateInteractions = async (
  data: Prisma.UserInteractionUncheckedCreateInput,
) =>
  withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return {
        error: "Unauthorized",
      }
    }

    const userInteraction = await updateUserInteraction(
      userId,
      {
        ...data,
        userId,
      },
      db,
    )

    return {
      error: null,
      userInteraction,
    }
  })

export const refreshUserPassport = async () =>
  withImpersonation(async ({ db, userId, session }) => {
    if (!userId) {
      return {
        error: "Unauthorized",
      }
    }

    return withImpersonationProtection(
      "Passport API",
      `Refresh passport scores for user ${userId}`,
      async (): Promise<{ error: string | null; success: boolean; mocked?: boolean }> => {
        const user = await getUserById(userId, db, session)

        if (!user) {
          return {
            error: "User not found",
            success: false,
          }
        }

        if (!user.addresses || user.addresses.length === 0) {
          return {
            error: "No addresses found",
            success: false,
          }
        }

        const apiKey = process.env.PASSPORT_API_KEY
        const scorerId = process.env.PASSPORT_SCORER_ID

        if (!apiKey || !scorerId) {
          return {
            error: "Passport API configuration is missing",
            success: false,
          }
        }

        // Delete existing passport records for addresses that are no longer associated with the user
        const existingPassports = await getUserPassports(userId, db)
        const currentAddresses = new Set(
          user.addresses.map((addr) => addr.address),
        )
        for (const passport of existingPassports) {
          if (!currentAddresses.has(passport.address)) {
            await deleteUserPassport(passport.id, db)
          }
        }

        const errors: string[] = []

        for (const address of user.addresses) {
          try {
            const response = await fetch(
              `https://api.passport.xyz/v2/stamps/${scorerId}/score/${address.address}`,
              {
                headers: {
                  "X-API-KEY": apiKey,
                },
              },
            )

            if (!response.ok) {
              const error = await response.text()
              errors.push(`Error for address ${address.address}: ${error}`)
              continue
            }

            const data = await response.json()

            await upsertUserPassport(
              {
                userId,
                passport: {
                  score: Number(data.score),
                  address: address.address,
                  expiresAt: new Date(data.expiration_timestamp),
                },
              },
              db,
            )
          } catch (error) {
            console.error(
              `Error fetching Passport score for address ${address.address}:`,
              error,
            )
            errors.push(
              `Error for address ${address.address}: Internal server error`,
            )
          }
        }

        return {
          error: errors.length > 0 ? errors.join(", ") : null,
          success: errors.length === 0,
        }
      },
      {
        error: null,
        success: true,
        mocked: true,
      },
    )
  })

export const getCitizenshipEligibility = async () =>
  withImpersonation(async ({ userId }) => {
    if (!userId) {
      return {
        error: "Unauthorized",
      }
    }

    return {
      isEligible: true,
    }
  })

export const updateEmailNotificationPreference = async (enabled: boolean) =>
  withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return {
        error: "Unauthorized",
      }
    }

    const updated = await updateUser(
      {
        id: userId,
        emailNotifEnabled: enabled,
      },
      db,
    )

    return {
      error: null,
      user: updated,
    }
  })
