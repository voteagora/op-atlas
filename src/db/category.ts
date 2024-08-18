import { prisma } from "./client"

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      impactStatements: true,
    },
  })
}
