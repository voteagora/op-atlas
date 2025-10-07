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

export async function getEndorsementCountsByRole({
  context,
  roleId,
}: {
  context: string
  roleId: number
}) {
  const apps = await prisma.roleApplication.findMany({
    where: { roleId },
    select: { id: true },
  })
  const nomineeApplicationIds = apps.map((a) => a.id)
  const map = await getEndorsementCounts({ context, nomineeApplicationIds })
  return map
}

export async function deleteEndorsementsForAddresses({
  context,
  nomineeApplicationId,
  addresses,
}: {
  context: string
  nomineeApplicationId: number
  addresses: string[]
}) {
  if (addresses.length === 0) return 0
  const lower = Array.from(new Set(addresses.map((a) => a.toLowerCase())))
  const res = await prisma.endorsement.deleteMany({
    where: {
      context,
      nomineeApplicationId,
      endorserAddress: { in: lower },
    },
  })
  return res.count
}

export async function getEndorsedNomineeIdsForAddressesByRole({
  context,
  roleId,
  addresses,
}: {
  context: string
  roleId: number
  addresses: string[]
}) {
  if (addresses.length === 0) return [] as number[]
  const lower = Array.from(new Set(addresses.map((a) => a.toLowerCase())))

  const apps = await prisma.roleApplication.findMany({
    where: { roleId },
    select: { id: true },
  })
  const nomineeApplicationIds = apps.map((a) => a.id)
  if (nomineeApplicationIds.length === 0) return []

  const rows = await prisma.endorsement.findMany({
    where: {
      context,
      nomineeApplicationId: { in: nomineeApplicationIds },
      endorserAddress: { in: lower },
    },
    select: { nomineeApplicationId: true },
  })
  return Array.from(new Set(rows.map((r) => r.nomineeApplicationId)))
}

export async function getApproversForNominee({
  context,
  nomineeApplicationId,
}: {
  context: string
  nomineeApplicationId: number
}) {
  // Fetch endorsements with direct relation to endorser user if available
  const endorsements = await prisma.endorsement.findMany({
    where: { context, nomineeApplicationId },
    include: {
      endorserUser: {
        select: { username: true, name: true, imageUrl: true, addresses: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Collect any addresses that didn't resolve a user to attempt a fallback map
  const unresolvedAddresses = endorsements
    .filter((e) => !e.endorserUser)
    .map((e) => e.endorserAddress.toLowerCase())

  const addressToUser = new Map<string, { username: string | null; name: string | null; imageUrl: string | null }>()

  if (unresolvedAddresses.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        addresses: {
          some: { address: { in: unresolvedAddresses } },
        },
      },
      select: { username: true, name: true, imageUrl: true, addresses: true },
    })
    for (const user of users) {
      for (const addr of user.addresses) {
        const lower = addr.address.toLowerCase()
        addressToUser.set(lower, {
          username: user.username ?? null,
          name: user.name ?? null,
          imageUrl: user.imageUrl ?? null,
        })
      }
    }
  }

  return endorsements.map((e) => ({
    address: e.endorserAddress.toLowerCase(),
    user: e.endorserUser
      ? {
          username: e.endorserUser.username ?? null,
          name: e.endorserUser.name ?? null,
          imageUrl: e.endorserUser.imageUrl ?? null,
        }
      : addressToUser.get(e.endorserAddress.toLowerCase()) || null,
  }))
}
