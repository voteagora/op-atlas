import { cache } from "react"

import { prisma } from "./client"

async function getCategoriesFn() {
  return prisma.category.findMany({
    include: {
      impactStatements: true,
    },
  })
}

export const getCategories = cache(getCategoriesFn)
