/**
 * Admin Impersonation Service
 * Handles user search, impersonation lifecycle, and audit logging
 */

import { Session } from "next-auth"
import adminDb from "@/db/adminClient"
import { isAdminUser, getAdminInfo } from "@/lib/auth/adminConfig"
import {
  IMPERSONATION_SESSION_DURATION_MS,
  SignedImpersonationSession,
  signImpersonationSession,
} from "@/lib/auth/impersonationSession"

export interface UserSearchResult {
  id: string
  name: string | null
  username: string | null
  imageUrl: string | null
  email?: string
  projectCount: number
  organizationCount: number
  hasApplications: boolean
  isCitizen: boolean
  hasApprovedKYC: boolean
  lastActive?: Date
}

export interface ImpersonationStartResult {
  success: boolean
  impersonation?: SignedImpersonationSession
  error?: string
}

class ImpersonationService {
  /**
   * Search for users to impersonate
   * Searches by name, username, email, or ID in the d-1 database
   */
  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult[]> {
    if (!adminDb.isD1Available()) {
      throw new Error('D-1 database not available')
    }

    const d1Client = adminDb.getClient(true)

    const users = await d1Client.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { id: { contains: query, mode: 'insensitive' } },
          { emails: { some: { email: { contains: query, mode: 'insensitive' } } } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true,
        emails: {
          take: 1,
          where: { verified: true },
          orderBy: { createdAt: 'desc' }
        },
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            organizations: true,
            roleApplications: true
          }
        },
        citizen: {
          select: { id: true }
        },
        userKYCUsers: {
          take: 1,
          where: {
            kycUser: {
              expiry: { gt: new Date() }
            }
          },
          select: {
            kycUser: {
              select: {
                status: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: [
        { updatedAt: 'desc' }
      ]
    })

    return users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl,
      email: user.emails[0]?.email,
      projectCount: user._count.projects,
      organizationCount: user._count.organizations,
      hasApplications: user._count.roleApplications > 0,
      isCitizen: !!user.citizen,
      hasApprovedKYC: user.userKYCUsers[0]?.kycUser?.status === 'APPROVED',
      lastActive: user.updatedAt
    }))
  }

  /**
   * Get detailed user info from d-1 database
   */
  async getUserDetails(userId: string) {
    if (!adminDb.isD1Available()) {
      throw new Error('D-1 database not available')
    }

    const d1Client = adminDb.getClient(true)

    const user = await d1Client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true,
        bio: true,
        emails: {
          take: 1,
          where: { verified: true },
          orderBy: { createdAt: 'desc' }
        },
        addresses: {
          take: 1,
          where: { primary: true }
        },
        _count: {
          select: {
            projects: true,
            organizations: true,
            roleApplications: true
          }
        },
        citizen: {
          select: {
            id: true,
            attestationId: true
          }
        }
      }
    })

    return user
  }

  /**
   * Start impersonating a user
   */
  async startImpersonation(
    adminUserId: string,
    targetUserId: string
  ): Promise<ImpersonationStartResult> {
    // 1. Verify admin permissions
    const isAdmin = await isAdminUser(adminUserId)
    if (!isAdmin) {
      return {
        success: false,
        error: 'Unauthorized: Only admin wallets can impersonate users'
      }
    }

    // 2. Verify d-1 is available
    if (!adminDb.isD1Available()) {
      return {
        success: false,
        error: 'D-1 database not configured. Cannot start impersonation.'
      }
    }

    // 3. Get admin info
    const adminInfo = await getAdminInfo(adminUserId)
    if (!adminInfo) {
      return {
        success: false,
        error: 'Admin user not found'
      }
    }

    // 4. Get target user from d-1 database
    const targetUser = await this.getUserDetails(targetUserId)
    if (!targetUser) {
      return {
        success: false,
        error: 'Target user not found in d-1 snapshot. User may not exist or d-1 needs refresh.'
      }
    }

    // 5. Prevent self-impersonation (optional security measure)
    if (adminUserId === targetUserId) {
      return {
        success: false,
        error: 'Cannot impersonate yourself'
      }
    }

    // 6. Create signed impersonation metadata
    const impersonation = this.buildSignedImpersonationSession({
      adminInfo,
      targetUser,
    })

    // 7. Audit log
    await this.logImpersonationEvent('START', {
      adminUserId: adminInfo.userId,
      adminAddress: adminInfo.adminAddress!,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name || targetUser.username || 'Unknown',
    })

    return {
      success: true,
      impersonation
    }
  }

  /**
   * Switch to a different user while already impersonating
   */
  async switchUser(
    currentSession: Session,
    newTargetUserId: string
  ): Promise<ImpersonationStartResult> {
    if (!currentSession.impersonation?.isActive) {
      return {
        success: false,
        error: 'Not currently impersonating'
      }
    }

    if (!adminDb.isD1Available()) {
      return {
        success: false,
        error: 'D-1 database not configured. Cannot switch impersonation.'
      }
    }

    const adminUserId = currentSession.impersonation.adminUserId
    const stillAdmin = await isAdminUser(adminUserId)
    if (!stillAdmin) {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges revoked. Please exit impersonation.'
      }
    }

    const adminInfo = await getAdminInfo(adminUserId)
    if (!adminInfo) {
      return {
        success: false,
        error: 'Admin user not found'
      }
    }

    if (adminUserId === newTargetUserId) {
      return {
        success: false,
        error: 'Cannot impersonate yourself'
      }
    }

    const targetUser = await this.getUserDetails(newTargetUserId)
    if (!targetUser) {
      return {
        success: false,
        error: 'Target user not found in d-1 snapshot. User may not exist or d-1 needs refresh.'
      }
    }

    const impersonation = this.buildSignedImpersonationSession({
      adminInfo,
      targetUser,
      startedAt: currentSession.impersonation.startedAt,
      lastSwitchedAt: new Date(),
    })

    await this.logImpersonationEvent('SWITCH', {
      adminUserId: adminInfo.userId,
      adminAddress: adminInfo.adminAddress,
      previousTargetUserId: currentSession.impersonation.targetUserId,
      newTargetUserId,
    })

    return {
      success: true,
      impersonation,
    }
  }

  /**
   * Stop impersonation
   */
  async stopImpersonation(session: Session) {
    if (!session.impersonation?.isActive) {
      throw new Error('Not currently impersonating')
    }

    const duration = Date.now() - new Date(session.impersonation.startedAt).getTime()

    await this.logImpersonationEvent('STOP', {
      adminUserId: session.impersonation.adminUserId,
      adminAddress: session.impersonation.adminAddress,
      targetUserId: session.impersonation.targetUserId,
      durationMs: duration,
    })
  }

  /**
   * Get impersonation statistics (for admin dashboard)
   * This would query an audit log table if implemented
   */
  async getImpersonationStats() {
    // TODO: Implement with audit log table
    return {
      totalSessions: 0,
      activeNow: 0,
      topImpersonatedUsers: [],
      topAdmins: []
    }
  }

  private buildSignedImpersonationSession({
    adminInfo,
    targetUser,
    startedAt,
    lastSwitchedAt,
  }: {
    adminInfo: { userId: string; adminAddress?: string | null }
    targetUser: NonNullable<
      Awaited<ReturnType<ImpersonationService['getUserDetails']>>
    >
    startedAt?: string
    lastSwitchedAt?: Date
  }): SignedImpersonationSession {
    if (!targetUser) {
      throw new Error('Target user missing when building impersonation session')
    }

    if (!adminInfo.adminAddress) {
      throw new Error('Admin wallet address missing for impersonation session')
    }

    const issuedAt = new Date()
    const expiresAt = new Date(
      issuedAt.getTime() + IMPERSONATION_SESSION_DURATION_MS,
    )

    return signImpersonationSession({
      isActive: true,
      adminUserId: adminInfo.userId,
      adminAddress: adminInfo.adminAddress,
      targetUserId: targetUser.id,
      targetUserName:
        targetUser.name || targetUser.username || 'Unknown User',
      targetUserEmail: targetUser.emails?.[0]?.email,
      targetUserImage: targetUser.imageUrl || undefined,
      startedAt: startedAt ?? issuedAt.toISOString(),
      lastSwitchedAt: lastSwitchedAt?.toISOString(),
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })
  }

  /**
   * Audit logging for impersonation events
   * Currently logs to console - can be extended to store in database
   */
  private async logImpersonationEvent(
    eventType: 'START' | 'STOP' | 'SWITCH',
    data: Record<string, any>
  ) {
    console.log(`🎭 ADMIN IMPERSONATION ${eventType}:`, {
      timestamp: new Date().toISOString(),
      eventType,
      ...data
    })
  }
}

export const impersonationService = new ImpersonationService()
