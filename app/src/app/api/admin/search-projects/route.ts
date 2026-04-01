/**
 * Project Search API for Admin Blacklist Management
 * GET /api/admin/search-projects?q=searchterm&limit=10
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/db/client"
import { requireAdminSession } from "@/lib/auth/adminSession"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminSession = await requireAdminSession()
    if (!adminSession.ok) {
      return adminSession.response
    }

    const { adminUserId } = adminSession

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limitParam = searchParams.get('limit')
    const excludeBlacklisted = searchParams.get('excludeBlacklisted') === 'true'
    const limit = limitParam ? parseInt(limitParam, 10) : 10

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        projects: [],
        message: 'Query too short (minimum 2 characters)'
      })
    }

    if (limit > 50) {
      return NextResponse.json({
        error: 'Limit too high (maximum 50 projects)'
      }, { status: 400 })
    }

    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { id: { contains: query, mode: 'insensitive' } },
        ],
        ...(excludeBlacklisted ? { blacklist: null } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        organization: {
          select: {
            organization: {
              select: {
                name: true,
              }
            }
          }
        },
        blacklist: {
          select: {
            id: true,
          }
        },
        _count: {
          select: {
            team: true,
            applications: true,
            rewards: true,
          }
        }
      },
      take: limit,
      orderBy: [
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        thumbnailUrl: project.thumbnailUrl,
        createdAt: project.createdAt,
        organizationName: project.organization?.organization?.name || null,
        isBlacklisted: !!project.blacklist,
        teamCount: project._count.team,
        applicationCount: project._count.applications,
        rewardCount: project._count.rewards,
      })),
      count: projects.length,
      query,
      viewerId: adminUserId,
    })
  } catch (error) {
    console.error('Project Search Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Search failed',
        details: 'Failed to search projects. Check server logs for details.'
      },
      { status: 500 }
    )
  }
}
