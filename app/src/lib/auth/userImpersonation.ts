/**
 * User Impersonation Service
 * 
 * Simple impersonation system for testing user scenarios
 */

import { User } from "@prisma/client"
import dualDb from "../../db/dualClient"

export interface UserProfile {
  id: string
  name?: string
  username?: string
  email?: string
  projectCount: number
  applicationCount: number
  citizenshipStatus: boolean
  userType: 'project-creator' | 'citizen' | 'applicant' | 'new-user'
}

export interface ImpersonationConfig {
  enabled: boolean
  productionAvailable: boolean
  maskSensitiveData: boolean
}

class UserImpersonationService {
  private config: ImpersonationConfig

  constructor() {
    this.config = {
      enabled: process.env.USE_IMPERSONATION === 'true',
      productionAvailable: dualDb.isProductionAvailable(),
      maskSensitiveData: process.env.IMPERSONATION_MASK_EMAILS === 'true'
    }
  }

  isAvailable(): boolean {
    return this.config.enabled && this.config.productionAvailable
  }

  getConfig(): ImpersonationConfig {
    return this.config
  }

  async discoverUsers(scenario: string): Promise<UserProfile[]> {
    if (!this.isAvailable()) {
      throw new Error('Impersonation not available')
    }

    const criteria = this.getScenarioCriteria(scenario)
    const users = await this.searchProductionUsers(criteria)
    return this.buildUserProfiles(users)
  }

  async impersonateUser(prodUserId: string, impersonatedBy: string): Promise<User> {
    if (!this.isAvailable()) {
      throw new Error('Impersonation not available')
    }

    // Get real user from production
    const realUser = await dualDb.getClient('prod').user.findUnique({
      where: { id: prodUserId },
      include: {
        emails: true,
        addresses: true,
        projects: true,
        roleApplications: true,
        citizen: true
      }
    })

    if (!realUser) {
      throw new Error(`User ${prodUserId} not found in production database`)
    }

    // Create impersonated user in test database
    const impersonatedUser = await dualDb.getClient('test').user.create({
      data: {
        id: `impersonated-${prodUserId}-${Date.now()}`,
        name: realUser.name,
        farcasterId: realUser.farcasterId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return impersonatedUser
  }

  async getStatistics(): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Impersonation not available')
    }

    const users = await dualDb.getClient('prod').user.findMany({
      include: {
        projects: true,
        roleApplications: true,
        citizen: true
      }
    })

    const stats = {
      totalUsers: users.length,
      projectCreators: users.filter(u => u.projects.length > 0).length,
      citizens: users.filter(u => u.citizen).length,
      applicants: users.filter(u => u.roleApplications.length > 0).length,
      powerUsers: users.filter(u => u.projects.length > 2 && u.roleApplications.length > 1).length
    }

    return stats
  }

  private getScenarioCriteria(scenario: string): { where: any; take: number } {
    const scenarios = {
      'project-creator': {
        where: { projects: { some: {} } },
        take: 5
      },
      'citizen': {
        where: { citizen: { isNot: null } },
        take: 5
      },
      'applicant': {
        where: { roleApplications: { some: {} } },
        take: 5
      },
      'new-user': {
        where: { 
          projects: { none: {} },
          roleApplications: { none: {} },
          citizen: null
        },
        take: 5
      }
    }
    return scenarios[scenario as keyof typeof scenarios] || { where: {}, take: 5 }
  }

  private async searchProductionUsers(criteria: { where: any; take: number }): Promise<any[]> {
    const users = await dualDb.getClient('prod').user.findMany({
      where: criteria.where,
      take: criteria.take,
      include: {
        emails: true,
        addresses: true,
        projects: true,
        roleApplications: true,
        citizen: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return users
  }

  private buildUserProfiles(users: any[]): UserProfile[] {
    return users.map(user => {
      const projectCount = user.projects?.length || 0
      const applicationCount = user.roleApplications?.length || 0
      const citizenshipStatus = !!user.citizen
      
      let userType: 'project-creator' | 'citizen' | 'applicant' | 'new-user' = 'new-user'
      if (projectCount > 0) userType = 'project-creator'
      else if (citizenshipStatus) userType = 'citizen'
      else if (applicationCount > 0) userType = 'applicant'

      return {
        id: user.id,
        name: user.name,
        username: user.username || user.name || user.emails?.[0]?.email || user.id,
        email: user.emails?.[0]?.email,
        projectCount,
        applicationCount,
        citizenshipStatus,
        userType
      }
    })
  }
}

export const userImpersonationService = new UserImpersonationService()
