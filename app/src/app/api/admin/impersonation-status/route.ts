/**
 * Admin Impersonation Status API
 * GET /api/admin/impersonation-status - Check if impersonation is available and current state
 */

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import adminDb from "@/db/adminClient"
import {
  getAdminWallets,
  isAdminUser,
  isImpersonationEnabled,
} from "@/lib/auth/adminConfig"
import { prisma } from "@/db/client"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    const adminUserId = session?.user?.id

    if (!adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No active session" },
        { status: 401 },
      )
    }

    const userIsAdmin = await isAdminUser(adminUserId)
    if (!userIsAdmin) {
      // Debug: fetch user's addresses to see why they're not admin
      const user = await prisma.user.findUnique({
        where: { id: adminUserId },
        include: { addresses: true }
      })

      const debugInfo = {
        userId: adminUserId,
        userFound: !!user,
        addressCount: user?.addresses?.length || 0,
        addresses: user?.addresses?.map(a => a.address) || [],
        adminWallets: getAdminWallets(),
        impersonationEnabled: isImpersonationEnabled(),
      }

      console.error("Admin check failed:", debugInfo)

      return NextResponse.json(
        {
          error: "Forbidden",
          details: "Admin access required",
          debug: debugInfo
        },
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
      viewerId: adminUserId,
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
