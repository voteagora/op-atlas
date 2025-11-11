/**
 * Admin Impersonation API
 * POST /api/admin/impersonate - Start or switch impersonation
 * DELETE /api/admin/impersonate - Stop impersonation
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { isAdminUser, isImpersonationEnabled } from "@/lib/auth/adminConfig"
import { getEffectiveUserId } from "@/lib/db/helpers"
import { impersonationService } from "@/lib/services/impersonationService"

export async function POST(request: NextRequest) {
  try {
    // Check if impersonation is enabled
    if (!isImpersonationEnabled()) {
      return NextResponse.json(
        { error: 'Admin impersonation is not enabled. Check ENABLE_ADMIN_IMPERSONATION and admin wallet configuration.' },
        { status: 503 }
      )
    }

    // Get current session
    const session = await auth()
    const userId = getEffectiveUserId(session)
    const adminUserId = session?.user?.id
    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
        { status: 401 },
      )
    }

    // Verify admin permission
    const isAdmin = await isAdminUser(adminUserId)
    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Admin access required. Only authorized wallets can impersonate users.",
        },
        { status: 403 },
      )
    }

    // Parse request body
    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required' },
        { status: 400 }
      )
    }

    // Start or switch impersonation
    let result
    if (session.impersonation?.isActive) {
      // Already impersonating, switch to new user
      result = await impersonationService.switchUser(session, targetUserId)
    } else {
      // Start fresh impersonation
      result = await impersonationService.startImpersonation(
        adminUserId,
        targetUserId,
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      impersonation: result.impersonation,
      viewerId: userId,
      message: session.impersonation?.isActive
        ? `Switched to user: ${result.impersonation?.targetUserName}`
        : `Now impersonating: ${result.impersonation?.targetUserName}`,
    })
  } catch (error) {
    console.error("Impersonation API Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details:
          "Failed to start/switch impersonation. Check server logs for details.",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    const userId = getEffectiveUserId(session)
    const adminUserId = session?.user?.id
    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const isAdmin = await isAdminUser(adminUserId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      )
    }

    if (!session.impersonation?.isActive) {
      return NextResponse.json(
        { error: "Not currently impersonating" },
        { status: 400 },
      )
    }

    // Log the stop event (actual session clearing happens on client via update())
    await impersonationService.stopImpersonation(session)

    return NextResponse.json({
      success: true,
      message: "Impersonation stopped. Returning to admin view.",
      viewerId: userId,
      // Client must call update({ impersonation: undefined }) to clear the JWT
      clearImpersonation: true,
    })
  } catch (error) {
    console.error("Stop Impersonation Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details:
          "Failed to stop impersonation. Check server logs for details.",
      },
      { status: 500 },
    )
  }
}
