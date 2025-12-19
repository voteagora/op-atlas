/**
 * Admin Database Client
 * Manages dual database connections (production + d-1 snapshot)
 *
 * Architecture:
 * - Production client: Normal app usage (default)
 * - D-1 client: Admin impersonation only (yesterday's data snapshot)
 *
 * Both clients are initialized once per serverless container and reused
 * across requests for optimal performance.
 */

import { PrismaClient } from "@prisma/client"

class AdminDatabaseClient {
  private prodClient: PrismaClient
  private d1Client: PrismaClient | null = null
  private static instance: AdminDatabaseClient | null = null

  private constructor() {
    // Production client (default for all non-admin requests)
    this.prodClient = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
      log: process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error']
    })

    // D-1 client (admin impersonation only)
    if (process.env.D1_DATABASE_URL) {
      this.d1Client = new PrismaClient({
        datasources: { db: { url: process.env.D1_DATABASE_URL } },
        log: process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error']
      })
      console.log('📊 D-1 database client initialized for admin impersonation')
    } else {
      console.warn('⚠️  D1_DATABASE_URL not configured - admin impersonation will be disabled')
    }
  }

  /**
   * Get singleton instance (one per serverless container)
   */
  static getInstance(): AdminDatabaseClient {
    if (!AdminDatabaseClient.instance) {
      AdminDatabaseClient.instance = new AdminDatabaseClient()
    }
    return AdminDatabaseClient.instance
  }

  /**
   * Get the appropriate Prisma client
   * @param useD1 - If true, returns d-1 client (throws if not configured)
   */
  getClient(useD1: boolean = false): PrismaClient {
    if (useD1) {
      if (!this.d1Client) {
        throw new Error(
          'D-1 database not configured. Set D1_DATABASE_URL environment variable to enable admin impersonation.'
        )
      }
      return this.d1Client
    }
    return this.prodClient
  }

  /**
   * Check if d-1 database is available
   */
  isD1Available(): boolean {
    return this.d1Client !== null
  }

  /**
   * Disconnect from all databases
   * Called during graceful shutdown
   */
  async disconnect(): Promise<void> {
    await this.prodClient.$disconnect()
    if (this.d1Client) {
      await this.d1Client.$disconnect()
    }
  }
}

// Export singleton instance
export const adminDb = AdminDatabaseClient.getInstance()
export default adminDb
