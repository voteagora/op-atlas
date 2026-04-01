/**
 * Admin Impersonation API
 * POST /api/admin/impersonate - Start or switch impersonation
 * DELETE /api/admin/impersonate - Stop impersonation
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/auth/adminSession"
import { impersonationService } from "@/lib/services/impersonationService"

export async function POST(request: NextRequest) {
  try {
    const adminSession = await requireAdminSession({
      disabledMessage:
        "Admin impersonation is not enabled. Check ENABLE_ADMIN_IMPERSONATION and admin wallet configuration.",
      noSessionMessage: "Unauthorized: No active session",
      forbiddenMessage:
        "Forbidden: Admin access required. Only authorized wallets can impersonate users.",
    })
    if (!adminSession.ok) {
      return adminSession.response
    }

    const { session, adminUserId } = adminSession

    // Parse request body
    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 },
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
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      impersonation: result.impersonation,
      viewerId: adminUserId,
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
    const adminSession = await requireAdminSession({
      noSessionMessage: "Unauthorized",
    })
    if (!adminSession.ok) {
      return adminSession.response
    }

    const { session, adminUserId } = adminSession

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
      viewerId: adminUserId,
      // Client must call update({ impersonation: undefined }) to clear the JWT
      clearImpersonation: true,
    })
  } catch (error) {
    console.error("Stop Impersonation Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: "Failed to stop impersonation. Check server logs for details.",
      },
      { status: 500 },
    )
  }
}
