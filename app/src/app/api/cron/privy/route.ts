import { prisma } from "@/db/client"
import { getUserConnectedAddresses } from "@/lib/neynar"
import { NextResponse } from "next/server"

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
  address: string
}

type LinkedAccount =
  | EmailLinkedAccount
  | WalletLinkedAccount
  | FarcasterLinkedAccount

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

    const results = await Promise.allSettled(
      users.map(async (user: any) => {
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

          // Link Discord
          if (user.discord) {
          }

          // Link Farcaster 
          if (user.farcasterId) {
            const farcasterAddresses = await getUserConnectedAddresses(user.farcasterId)

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
            return {
              userId: user.id,
              status: "skipped",
              reason: "No linked accounts available",
            }
          }




          // Create user in Privy using the API
          const privyResponse = await fetch("https://api.privy.io/v1/users", {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`,
              ).toString("base64")}`,
              "Content-Type": "application/json",
              "privy-app-id": process.env.PRIVY_APP_ID || "",
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


          // Update user in our database with privyDid using raw SQL
          await prisma.$executeRaw`
          UPDATE "User"
          SET "privyDid" = ${privyUser.id}, "updatedAt" = NOW()
          WHERE "id" = ${user.id}
          `
          console.log("Privy user created", privyUser.id)


          return {
            userId: user.id,
            status: "success",
            privyDid: privyUser.id,
          }
        } catch (error) {
          console.error(`Error creating Privy user for user ${user.id}:`, error)
          return {
            userId: user.id,
            status: "error",
            error: String(error),
          }
        }
      }),
    )

    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success",
    ).length
    const failed = results.filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && r.value.status === "error"),
    ).length
    const skipped = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "skipped",
    ).length

    return NextResponse.json({
      status: "success",
      count: users.length,
      processed: {
        total: users.length,
        succeeded,
        failed,
        skipped,
      },
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
