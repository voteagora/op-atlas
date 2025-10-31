import "server-only"

import { prisma } from "@/db/client"

type PriorityLookupArgs = {
  seasonId: string
  addresses: readonly string[]
}

export async function findPriorityAttestations({
  seasonId,
  addresses,
}: PriorityLookupArgs) {
  if (!seasonId) {
    throw new Error("seasonId is required")
  }

  const normalized = normalizeAddresses(addresses)
  if (normalized.length === 0) {
    return []
  }

  return prisma.priorityAttestationSnapshot.findMany({
    where: {
      seasonId,
      address: {
        in: normalized,
      },
    },
  })
}

export async function hasPriorityAttestation(args: PriorityLookupArgs) {
  const results = await findPriorityAttestations(args)
  return results.length > 0
}

function normalizeAddresses(addresses: readonly string[]) {
  const deduped = new Set<string>()

  for (const address of addresses) {
    if (!address) continue
    deduped.add(address.toLowerCase())
  }

  return Array.from(deduped)
}
