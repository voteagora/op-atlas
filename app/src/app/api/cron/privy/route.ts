import { NextResponse } from "next/server"

import { prisma } from "@/db/client"
import { getUserConnectedAddresses } from "@/lib/neynar"

// Set a generous time limit for processing
export const maxDuration = 300

// Define types for linked accounts
interface EmailLinkedAccount {
  type: "email"
  address: string
}

interface WalletLinkedAccount {
  type: "wallet"
  address: string
  chain_type: string
}

interface FarcasterLinkedAccount {
  type: "farcaster"
  fid: number
  owner_address: string
}

interface DiscordLinkedAccount {
  type: "discord"
  subject: string
}

interface GithubLinkedAccount {
  type: "github_oauth"
  subject: string
  username: string
}

type LinkedAccount =
  | EmailLinkedAccount
  | WalletLinkedAccount
  | FarcasterLinkedAccount
  | DiscordLinkedAccount
  | GithubLinkedAccount

/**
 * Endpoint that selects all users where privyDid is null and creates Privy accounts for them
 */
export async function GET() {
  try {
    // Use a raw query to find users with null privyDid
    const users = await prisma.$queryRaw`
            SELECT u.*, 
                   json_agg(DISTINCT a) FILTER (WHERE a.address IS NOT NULL) as addresses,
                   json_agg(DISTINCT e) FILTER (WHERE e.email IS NOT NULL) as emails
            FROM "User" u
            LEFT JOIN "UserAddress" a ON u.id = a."userId"
            LEFT JOIN "UserEmail" e ON u.id = e."userId"
            WHERE u."privyDid" IS NULL
            AND u."deletedAt" IS NULL
            GROUP BY u.id
        `

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({
        status: "success",
        message: "No users found with null privyDid",
        count: 0,
      })
    }

    const results = []

    for (const user of users) {
      try {
        const linkedAccounts: LinkedAccount[] = []

        // Link email
        if (user.emails && user.emails.length > 0) {
          const email = user.emails[0]?.email
          if (email) {
            linkedAccounts.push({
              type: "email",
              address: email,
            })
          }
        }

        // Link wallets
        if (user.addresses && user.addresses.length > 0) {
          user.addresses.forEach((address: any) => {
            linkedAccounts.push({
              type: "wallet",
              chain_type: "ethereum",
              address: address.address,
            })
          })
        }

        // Link GitHub
        if (user.github) {
          try {
            const githubResponse = await fetch(
              `https://api.github.com/users/${user.github}`,
              {
                headers: {
                  Authorization: `token ${process.env.GITHUB_AUTH_TOKEN}`,
                  Accept: "application/vnd.github.v3+json",
                },
              },
            )

            if (!githubResponse.ok) {
              throw new Error(`GitHub API error: ${githubResponse.statusText}`)
            }

            const githubUser = await githubResponse.json()

            linkedAccounts.push({
              type: "github_oauth",
              subject: githubUser.node_id,
              username: githubUser.login,
            })
          } catch (error) {
            console.error(
              `Error fetching GitHub user data for ${user.github}:`,
              error,
            )
          }
        }

        // Link Farcaster
        if (user.farcasterId) {
          const farcasterAddresses = await getUserConnectedAddresses(
            user.farcasterId,
          )

          if (farcasterAddresses && farcasterAddresses.length > 0) {
            linkedAccounts.push({
              type: "farcaster",
              fid: Number(user.farcasterId),
              owner_address: farcasterAddresses[0],
            })
          }
        }

        // Skip if no linked accounts can be created
        if (linkedAccounts.length === 0) {
          results.push({
            userId: user.id,
            status: "skipped",
            reason: "No linked accounts available",
          })
          continue
        }

        // Create user in Privy using the API
        const privyResponse = await fetch("https://api.privy.io/v1/users", {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`,
            ).toString("base64")}`,
            "Content-Type": "application/json",
            "privy-app-id": process.env.PRIVY_APP_ID!,
          },
          body: JSON.stringify({
            linked_accounts: linkedAccounts,
          }),
        })

        if (!privyResponse.ok) {
          const errorData = await privyResponse.json()
          throw new Error(`Privy API error: ${JSON.stringify(errorData)}`)
        }

        const privyUser = await privyResponse.json()

        await prisma.$executeRaw`
          UPDATE "User"
          SET "privyDid" = ${privyUser.id}, "updatedAt" = NOW()
          WHERE "id" = ${user.id}
        `

        results.push({
          userId: user.id,
          status: "success",
          privyDid: privyUser.id,
        })
      } catch (error) {
        console.error(`Error creating Privy user for user ${user.id}:`, error)
        results.push({
          userId: user.id,
          status: "error",
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      status: "success",
      count: users.length,
      results,
    })
  } catch (error) {
    console.error("Error processing users with null privyDid:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to process users",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
