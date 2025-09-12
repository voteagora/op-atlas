/**
 * Dual Database Client
 * 
 * Manages separate connections to test and production databases
 * Production database is strictly read-only for safety
 */

import { PrismaClient } from "@prisma/client"

class DualDatabaseClient {
  private testClient: PrismaClient
  private prodClient: PrismaClient | null = null
  private isInitialized = false

  constructor() {
    // Always initialize test client
    this.testClient = this.createPrismaClient(process.env.DATABASE_URL!)
    
    // Initialize production client only if configured and in safe mode
    if (process.env.PROD_DATABASE_URL && process.env.PROD_DB_READ_ONLY === 'true') {
      this.prodClient = this.createReadOnlyPrismaClient(process.env.PROD_DATABASE_URL)
      this.isInitialized = true
      console.log('🔒 Production database connected in READ-ONLY mode')
    } else if (process.env.PROD_DATABASE_URL) {
      console.warn('⚠️ Production database URL provided but PROD_DB_READ_ONLY not set to true. Skipping production connection for safety.')
    }
  }

  private createPrismaClient(databaseUrl: string): PrismaClient {
    const isEdge = process.env.NEXT_RUNTIME === "edge"
    
    if (isEdge) {
      return new PrismaClient({
        datasources: { db: { url: databaseUrl } }
      })
    }

    return new PrismaClient({
      datasources: { db: { url: databaseUrl } }
    })
  }

  private createReadOnlyPrismaClient(databaseUrl: string): PrismaClient {
    const isEdge = process.env.NEXT_RUNTIME === "edge"
    
    if (isEdge) {
      return new PrismaClient({
        datasources: { db: { url: databaseUrl } }
      })
    }

    const client = new PrismaClient({
      datasources: { db: { url: databaseUrl } }
    })

    // Create a read-only client that blocks all write operations
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, model, args, query }) {
            // Block all write operations on production database
            if (['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'].includes(operation)) {
              throw new Error(`🚫 BLOCKED: ${operation} operation on production database. Production database is READ-ONLY.`)
            }
            
            return await query(args)
          },
        },
        async $queryRaw({ args, query, operation }) {
          return await query(args)
        },
        async $executeRaw({ args, query, operation }) {
          throw new Error('🚫 BLOCKED: $executeRaw on production database. Production database is READ-ONLY.')
        },
        async $queryRawUnsafe({ args, query, operation }) {
          return await query(args)
        },
        async $executeRawUnsafe({ args, query, operation }) {
          throw new Error('🚫 BLOCKED: $executeRawUnsafe on production database. Production database is READ-ONLY.')
        },
      },
    }) as PrismaClient
  }

  getClient(type: 'test' | 'prod'): PrismaClient {
    if (type === 'test') {
      return this.testClient
    }
    
    if (type === 'prod') {
      if (!this.prodClient) {
        throw new Error('Production database not available. Check PROD_DATABASE_URL and PROD_DB_READ_ONLY settings.')
      }
      return this.prodClient
    }
    
    throw new Error('Invalid client type. Use "test" or "prod".')
  }

  isProductionAvailable(): boolean {
    return this.isInitialized && this.prodClient !== null
  }

  async disconnect(): Promise<void> {
    await this.testClient.$disconnect()
    if (this.prodClient) {
      await this.prodClient.$disconnect()
    }
  }
}

export const dualDb = new DualDatabaseClient()
export default dualDb
