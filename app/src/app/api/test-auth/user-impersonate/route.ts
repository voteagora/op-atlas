/**
 * User Impersonation API
 */

import { NextRequest, NextResponse } from "next/server"
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

    let result
    if (scenario) {
      // Discover and impersonate first user for scenario
      const users = await userImpersonationService.discoverUsers(scenario)
      if (users.length === 0) {
        return NextResponse.json({
          success: false,
          error: `No users found for scenario: ${scenario}`
        }, { status: 404 })
      }
      result = await userImpersonationService.impersonateUser(users[0].id, impersonatedBy || "test-system")
    } else {
      result = await userImpersonationService.impersonateUser(prodUserId, impersonatedBy || "test-system")
    }

    return NextResponse.json({
      success: true,
      user: result,
      message: "User impersonated successfully"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Impersonation failed"
    }, { status: 500 })
  }
}
