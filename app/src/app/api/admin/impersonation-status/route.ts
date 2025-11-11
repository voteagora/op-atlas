/**
 * Admin Impersonation Status API
 * GET /api/admin/impersonation-status - Check if impersonation is available and current state
 */

import { NextResponse } from "next/server"
import adminDb from "@/db/adminClient"
import {
  getAdminWallets,
  isAdminUser,
  isImpersonationEnabled,
} from "@/lib/auth/adminConfig"
import { withImpersonation } from "@/lib/db/sessionContext"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { session, userId } = await withImpersonation()
    const adminUserId = session?.user?.id

    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No active session" },
        { status: 401 },
      )
    }

    const userIsAdmin = await isAdminUser(adminUserId)
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Forbidden", details: "Admin access required" },
        { status: 403 },
      )
    }

    const status = {
      enabled: isImpersonationEnabled(),
      d1Available: adminDb.isD1Available(),
      userIsAdmin,
      currentlyImpersonating: !!session?.impersonation?.isActive,
      impersonation: session?.impersonation || null,
      adminWalletCount: getAdminWallets().length,
      environment: process.env.NODE_ENV || "unknown",
      viewerId: userId,
    }

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error("Status Check Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Status check failed",
        details:
          "Failed to check impersonation status. Check server logs for details.",
      },
      { status: 500 },
    )
  }
}
