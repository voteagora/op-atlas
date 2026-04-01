/**
 * User Search API for Admin Impersonation
 * GET /api/admin/search-users?q=searchterm&limit=10
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/auth/adminSession"
import { impersonationService } from "@/lib/services/impersonationService"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminSession = await requireAdminSession({
      disabledMessage: "Admin impersonation not enabled",
    })
    if (!adminSession.ok) {
      return adminSession.response
    }

    const { adminUserId } = adminSession

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 10

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        users: [],
        message: 'Query too short (minimum 2 characters)'
      })
    }

    if (limit > 50) {
      return NextResponse.json({
        error: 'Limit too high (maximum 50 users)'
      }, { status: 400 })
    }

    const users = await impersonationService.searchUsers(query, limit)

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      query,
      viewerId: adminUserId,
    })
  } catch (error) {
    console.error('User Search Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Search failed',
        details: 'Failed to search users. Check server logs for details.'
      },
      { status: 500 }
    )
  }
}
