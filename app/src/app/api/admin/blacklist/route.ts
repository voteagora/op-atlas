/**
 * Admin Blacklist Management API
 * GET /api/admin/blacklist - List all blacklisted projects
 * POST /api/admin/blacklist - Add project to blacklist
 * DELETE /api/admin/blacklist - Remove project from blacklist
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { isAdminUser, isImpersonationEnabled } from "@/lib/auth/adminConfig"
import { prisma } from "@/db/client"

export const dynamic = 'force-dynamic'

/**
 * GET - List blacklisted projects with pagination
 */
export async function GET(request: NextRequest) {
  try {
    if (!isImpersonationEnabled()) {
      return NextResponse.json(
        { error: 'Admin features not enabled' },
        { status: 503 }
      )
    }

    const session = await auth()
    const adminUserId = session?.user?.id
    if (!adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
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

    // Parse pagination params
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get('page')
    const pageSizeParam = searchParams.get('pageSize')
    const page = pageParam ? Math.max(0, parseInt(pageParam, 10)) : 0
    const pageSize = pageSizeParam ? Math.min(100, Math.max(1, parseInt(pageSizeParam, 10))) : 20

    // Get total count
    const totalCount = await prisma.projectBlacklist.count()

    // Get paginated results
    const blacklistedProjects = await prisma.projectBlacklist.findMany({
      include: {
        project: {
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
            team: {
              where: {
                role: 'admin',
                deletedAt: null,
              },
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    imageUrl: true,
                  }
                }
              },
              take: 1,
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: page * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      success: true,
      blacklist: blacklistedProjects.map(item => {
        const admin = item.project.team[0]?.user || null
        return {
          id: item.id,
          projectId: item.projectId,
          reason: item.reason,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          project: {
            id: item.project.id,
            name: item.project.name,
            description: item.project.description,
            thumbnailUrl: item.project.thumbnailUrl,
            createdAt: item.project.createdAt,
            organizationName: item.project.organization?.organization?.name || null,
            admin: admin ? {
              id: admin.id,
              name: admin.name,
              username: admin.username,
              imageUrl: admin.imageUrl,
            } : null,
          }
        }
      }),
      count: blacklistedProjects.length,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      viewerId: adminUserId,
    })
  } catch (error) {
    console.error('Blacklist GET Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch blacklist',
        details: 'Check server logs for details.'
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Add project to blacklist
 */
export async function POST(request: NextRequest) {
  try {
    if (!isImpersonationEnabled()) {
      return NextResponse.json(
        { error: 'Admin features not enabled' },
        { status: 503 }
      )
    }

    const session = await auth()
    const adminUserId = session?.user?.id
    if (!adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
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

    const body = await request.json()
    const { projectId, reason } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if already blacklisted
    const existing = await prisma.projectBlacklist.findUnique({
      where: { projectId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Project is already blacklisted' },
        { status: 409 }
      )
    }

    // Add to blacklist
    const blacklistEntry = await prisma.projectBlacklist.create({
      data: {
        projectId,
        reason: reason || null,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Project "${project.name}" added to blacklist`,
      blacklistEntry: {
        id: blacklistEntry.id,
        projectId: blacklistEntry.projectId,
        reason: blacklistEntry.reason,
        createdAt: blacklistEntry.createdAt,
      },
      viewerId: adminUserId,
    })
  } catch (error) {
    console.error('Blacklist POST Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to add to blacklist',
        details: 'Check server logs for details.'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove project from blacklist
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!isImpersonationEnabled()) {
      return NextResponse.json(
        { error: 'Admin features not enabled' },
        { status: 503 }
      )
    }

    const session = await auth()
    const adminUserId = session?.user?.id
    if (!adminUserId) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
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

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Check if blacklist entry exists
    const existing = await prisma.projectBlacklist.findUnique({
      where: { projectId },
      include: {
        project: {
          select: { name: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Project is not blacklisted' },
        { status: 404 }
      )
    }

    // Remove from blacklist
    await prisma.projectBlacklist.delete({
      where: { projectId }
    })

    return NextResponse.json({
      success: true,
      message: `Project "${existing.project.name}" removed from blacklist`,
      projectId,
      viewerId: adminUserId,
    })
  } catch (error) {
    console.error('Blacklist DELETE Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to remove from blacklist',
        details: 'Check server logs for details.'
      },
      { status: 500 }
    )
  }
}
