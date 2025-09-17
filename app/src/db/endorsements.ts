import { prisma } from "@/db/client"

export async function createEndorsement({
  context,
  nomineeApplicationId,
  endorserAddress,
  endorserUserId,
}: {
  context: string
  nomineeApplicationId: number
  endorserAddress: string
  endorserUserId?: string
}) {
  return prisma.endorsement.upsert({
    where: {
      context_nomineeApplicationId_endorserAddress: {
        context,
        nomineeApplicationId,
        endorserAddress: endorserAddress.toLowerCase(),
      },
    },
    create: {
      context,
      nomineeApplicationId,
      endorserAddress: endorserAddress.toLowerCase(),
      endorserUserId,
    },
    update: {
      endorserUserId: endorserUserId,
    },
    select: { id: true },
  })
}

export async function hasEndorsed({
  context,
  nomineeApplicationId,
  endorserAddress,
}: {
  context: string
  nomineeApplicationId: number
  endorserAddress: string
}) {
  const existing = await prisma.endorsement.findUnique({
    where: {
      context_nomineeApplicationId_endorserAddress: {
        context,
        nomineeApplicationId,
        endorserAddress: endorserAddress.toLowerCase(),
      },
    },
    select: { id: true },
  })
  return !!existing
}

export async function getEndorsementCounts({
  context,
  nomineeApplicationIds,
}: {
  context: string
  nomineeApplicationIds: number[]
}) {
  if (nomineeApplicationIds.length === 0) return new Map<number, number>()
  const rows = await prisma.endorsement.groupBy({
    by: ["nomineeApplicationId"],
    where: {
      context,
      nomineeApplicationId: { in: nomineeApplicationIds },
    },
    _count: { _all: true },
  })
  const map = new Map<number, number>()
  for (const row of rows) map.set(row.nomineeApplicationId, row._count._all)
  return map
}
