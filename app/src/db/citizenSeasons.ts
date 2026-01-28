import "server-only"

import {
  CitizenRegistrationStatus,
  citizenCategory,
  Prisma,
} from "@prisma/client"
import { getAddress, isAddress } from "viem"

import { prisma } from "@/db/client"

export async function getCitizenSeasonByUser({
  seasonId,
  userId,
  includeRevoked = false,
}: {
  seasonId: string
  userId: string
  includeRevoked?: boolean
}) {
  return prisma.citizenSeason.findFirst({
    where: {
      seasonId,
      userId,
      registrationStatus: includeRevoked
        ? undefined
        : {
            not: CitizenRegistrationStatus.REVOKED,
          },
    },
    select: {
      id: true,
      seasonId: true,
      userId: true,
      governanceAddress: true,
      registrationStatus: true,
      attestationId: true,
      organizationId: true,
      projectId: true,
      organization: true,
      project: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getCitizenSeasonsByGovernanceAddresses({
  seasonId,
  addresses,
  includeRevoked = false,
}: {
  seasonId: string
  addresses: string[]
  includeRevoked?: boolean
}) {
  if (addresses.length === 0) {
    return []
  }

  const lowercasedAddresses = addresses.map((addr) => addr.toLowerCase())

  return prisma.citizenSeason.findMany({
    where: {
      seasonId,
      governanceAddress: {
        in: lowercasedAddresses,
        mode: "insensitive",
      },
      registrationStatus: includeRevoked
        ? undefined
        : {
            not: CitizenRegistrationStatus.REVOKED,
          },
    },
    select: {
      id: true,
      seasonId: true,
      userId: true,
      governanceAddress: true,
      registrationStatus: true,
      organizationId: true,
      projectId: true,
      organization: true,
      project: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getCitizenSeasonByOrganization({
  seasonId,
  organizationId,
}: {
  seasonId: string
  organizationId: string
}) {
  return prisma.citizenSeason.findFirst({
    where: {
      seasonId,
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getCitizenSeasonByProject({
  seasonId,
  projectId,
}: {
  seasonId: string
  projectId: string
}) {
  return prisma.citizenSeason.findFirst({
    where: {
      seasonId,
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

type CitizenSeasonUpsertData = Omit<
  Prisma.CitizenSeasonUncheckedCreateInput,
  "seasonId" | "userId"
>

export async function upsertCitizenSeason({
  seasonId,
  userId,
  data,
}: {
  seasonId: string
  userId: string
  data: CitizenSeasonUpsertData
}) {
  const checksummedData =
    data.governanceAddress && isAddress(data.governanceAddress)
      ? { ...data, governanceAddress: getAddress(data.governanceAddress) }
      : data

  const existing = await prisma.citizenSeason.findFirst({
    where: {
      seasonId,
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (existing) {
    return prisma.citizenSeason.update({
      where: { id: existing.id },
      data: checksummedData,
    })
  }

  return prisma.citizenSeason.create({
    data: {
      seasonId,
      userId,
      ...checksummedData,
    },
  })
}

export async function countCitizenSeasons({
  seasonId,
  type,
  statuses = [
    CitizenRegistrationStatus.ATTESTED,
    CitizenRegistrationStatus.READY,
  ],
}: {
  seasonId: string
  type: citizenCategory
  statuses?: CitizenRegistrationStatus[]
}) {
  // Infer type from relationships since type field was removed
  const typeFilter =
    type === citizenCategory.USER
      ? { organizationId: null, projectId: null }
      : type === citizenCategory.CHAIN
      ? { organizationId: { not: null }, projectId: null }
      : { organizationId: null, projectId: { not: null } }

  return prisma.citizenSeason.count({
    where: {
      seasonId,
      ...typeFilter,
      registrationStatus: {
        in: statuses,
      },
    },
  })
}

export async function checkWalletEligibility(
  address: string,
  seasonId: string,
): Promise<boolean> {
  const result = await prisma.citizenQualifyingUser.findUnique({
    where: {
      seasonId_address: {
        seasonId,
        address: address.toLowerCase(),
      },
    },
  })
  return !!result
}

export async function findBlockedCitizenSeasonEvaluation({
  userId,
  seasonId,
}: {
  userId: string
  seasonId: string
}) {
  return prisma.citizenSeasonEvaluation.findFirst({
    where: {
      userId,
      seasonId,
      outcome: CitizenRegistrationStatus.BLOCKED,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getCitizenSeasonByGovernanceAddress(address: string) {
  return prisma.citizenSeason.findFirst({
    where: {
      governanceAddress: {
        equals: address,
        mode: "insensitive",
      },
      registrationStatus: {
        not: CitizenRegistrationStatus.REVOKED,
      },
    },
    include: {
      user: true,
      organization: true,
      project: true,
      season: true,
    },
    orderBy: [{ season: { startDate: "desc" } }, { createdAt: "desc" }],
  })
}
