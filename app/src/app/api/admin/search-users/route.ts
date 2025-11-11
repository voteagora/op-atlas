/**
 * User Search API for Admin Impersonation
 * GET /api/admin/search-users?q=searchterm&limit=10
 */

import { NextRequest, NextResponse } from "next/server"
import { isAdminUser, isImpersonationEnabled } from "@/lib/auth/adminConfig"
import { withImpersonation } from "@/lib/db/sessionContext"
import { impersonationService } from "@/lib/services/impersonationService"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!isImpersonationEnabled()) {
      return NextResponse.json(
        { error: 'Admin impersonation not enabled' },
        { status: 503 }
      )
    }

    const { session, userId } = await withImpersonation()
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
      viewerId: userId,
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
