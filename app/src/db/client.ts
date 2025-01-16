import { PrismaClient } from "@prisma/client"

import { timeThis } from "@/logging"

const prismaClientSingleton = () => {
  // Check if running in edge runtime
  const isEdge = process.env.NEXT_RUNTIME === "edge"
  return isEdge ? new PrismaClient() : (makePrismaClient() as PrismaClient)
}

// Logging middleware
const makePrismaClient = () => {
  const execRaw = async (
    query: (args: any) => Promise<any>,
    args: any,
    operation: string,
  ) => {
    return await timeThis(async () => await query(args), {
      operation,
      args,
    })
  }
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          return await timeThis(async () => await query(args), {
            model,
            operation,
            args,
          })
        },
      },
      async $queryRaw({ args, query, operation }) {
        return await execRaw(query, args, operation)
      },
      async $executeRaw({ args, query, operation }) {
        return await execRaw(query, args, operation)
      },
      async $queryRawUnsafe({ args, query, operation }) {
        return await execRaw(query, args, operation)
      },
      async $executeRawUnsafe({ args, query, operation }) {
        return await execRaw(query, args, operation)
      },
    },
  })
}

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>
} & typeof global

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
