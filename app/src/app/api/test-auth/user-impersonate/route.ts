/**
 * User Impersonation API
 */

import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/auth"
import { userImpersonationService } from "../../../../lib/auth/userImpersonation"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "status":
        return NextResponse.json({
          success: true,
          available: userImpersonationService.isAvailable(),
          environment: process.env.NODE_ENV || 'development',
          config: userImpersonationService.getConfig()
        })

      case "discover":
        const scenario = searchParams.get("scenario") || "project-creator"
        const users = await userImpersonationService.discoverUsers(scenario)
        return NextResponse.json({
          success: true,
          users,
          count: users.length
        })

      case "stats":
        const stats = await userImpersonationService.getStatistics()
        return NextResponse.json({
          success: true,
          stats
        })

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action"
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario, prodUserId, impersonatedBy } = body

    if (!scenario && !prodUserId) {
      return NextResponse.json({
        success: false,
        error: "scenario or prodUserId required"
      }, { status: 400 })
    }

    let userToImpersonateId = prodUserId

    if (scenario && !prodUserId) {
      // Discover and get first user for scenario
      const users = await userImpersonationService.discoverUsers(scenario)
      if (users.length === 0) {
        return NextResponse.json({
          success: false,
          error: `No users found for scenario: ${scenario}`
        }, { status: 404 })
      }
      userToImpersonateId = users[0].id
    }

    // Get real user data from production database
    const realUser = await userImpersonationService.getRealUserData(userToImpersonateId)
    if (!realUser) {
      return NextResponse.json({
        success: false,
        error: `User ${userToImpersonateId} not found in production database`
      }, { status: 404 })
    }

    // Create impersonated user in test database
    const impersonatedUser = await userImpersonationService.createImpersonatedUser(realUser, impersonatedBy || "test-system")

    // Sign in as the impersonated user using the test auth system
    const result = await signIn("credentials", {
      privy: JSON.stringify({
        id: impersonatedUser.privyDid,
        email: { address: realUser.emails?.[0]?.email || "impersonated@example.com" },
        createdAt: impersonatedUser.createdAt.toISOString(),
      }),
      privyAccessToken: "mock-impersonation-token",
      testMode: "true",
      testUserId: impersonatedUser.id,
      redirect: false,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: impersonatedUser.id,
        name: impersonatedUser.name,
        email: realUser.emails?.[0]?.email || "impersonated@example.com",
        imageUrl: impersonatedUser.imageUrl,
        isImpersonated: true,
        originalUserId: userToImpersonateId
      },
      message: "User impersonated and signed in successfully"
    })
  } catch (error) {
    console.error("Impersonation API Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Impersonation failed"
    }, { status: 500 })
  }
}
