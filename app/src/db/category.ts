import { PrismaClient } from "@prisma/client"
import { cache } from "react"

import { prisma } from "./client"

async function getCategoriesFn(db: PrismaClient) {
  return db.category.findMany({
    include: {
      impactStatements: true,
    },
  })
}

export const getCategories = cache(() => getCategoriesFn(prisma))

export async function getCategoriesWithClient(db: PrismaClient = prisma) {
  return getCategoriesFn(db)
}
