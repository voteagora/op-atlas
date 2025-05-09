"use server"

import {
  Prisma,
  User,
  UserAddress,
  UserEmail,
  UserInteraction,
} from "@prisma/client"
import { AggregatedType } from "eas-indexer/src/types"

import {
  CONTRIBUTOR_ELIGIBLE_PROJECTS,
  EXTENDED_TAG_BY_ENTITY,
} from "@/lib/constants"
import { ExtendedAggregatedType, UserAddressSource } from "@/lib/types"

import { auth } from "@/auth"
import { generateTemporaryUsername } from "@/lib/utils/username"
import { prisma } from "./client"

export type Entity = keyof ExtendedAggregatedType
export type EntityObject = {
  address: string
  email: string
}
export type EntityRecords = Record<
  Exclude<Entity, "badgeholder">,
  EntityObject[]
>

export async function getUserById(userId: string) {
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      addresses: {
        orderBy: {
          primary: "desc",
        },
      },
      interaction: true,
      emails: true,
    },
  })

  // If user is not logged in or requesting different user's data, remove sensitive information
  // but return the same object structure for consistency
  if (!session?.user || session.user.id !== userId && user) {
    if (user) {
      user.emails = []
      user.interaction = null
      user.privyDid = null
      user.createdAt = new Date(0)
      user.deletedAt = new Date(0)
      user.updatedAt = new Date(0)
      user.notDeveloper = false
      return user
    }
  }

  return user
}

export async function getUserByPrivyDid(privyDid: string): Promise<
  | (User & {
    addresses: UserAddress[]
    interaction: UserInteraction | null
    emails: UserEmail[]
  })
  | null
> {
  return prisma.user.findFirst({
    where: {
      privyDid: privyDid as string,
    },
    include: {
      addresses: {
        orderBy: {
          primary: "desc",
        },
      },
      interaction: true,
      emails: true,
    },
  })
}

export async function getUserByAddress(address: string): Promise<User | null> {
  const userAddress = await prisma.userAddress.findFirst({
    where: {
      address,
    },
    include: {
      user: {
        include: {
          addresses: {
            orderBy: {
              primary: "desc",
            },
          },
          interaction: true,
          emails: true,
        },
      },
    },
  })

  return userAddress?.user || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userEmail = await prisma.userEmail.findFirst({
    where: {
      email,
    },
    include: {
      user: {
        include: {
          addresses: {
            orderBy: {
              primary: "desc",
            },
          },
          interaction: true,
          emails: true,
        },
      },
    },
  })

  return userEmail?.user || null
}

export async function getUserByFarcasterId(farcasterId: string) {
  return prisma.user.findUnique({
    where: {
      farcasterId,
    },
    include: {
      addresses: true,
      emails: true,
    },
  })
}

export async function getUserByUsername(username: string): Promise<
  | (User & {
    addresses: UserAddress[]
    interaction: UserInteraction | null
    emails: UserEmail[]
  })
  | null
> {
  const result = await prisma.$queryRaw<
    (User & {
      addresses: UserAddress[]
      interaction: UserInteraction | null
      emails: UserEmail[]
    })[]
  >`
    SELECT 
      u.*,
      json_agg(DISTINCT a) FILTER (WHERE a."address" IS NOT NULL) as "addresses",
      json_agg(DISTINCT e) FILTER (WHERE e."email" IS NOT NULL) as "emails",
      CASE 
        WHEN i."id" IS NOT NULL THEN
          json_build_object(
            'id', i."id",
            'userId', i."userId",
            'finishSetupLinkClicked', i."finishSetupLinkClicked",
            'orgSettingsVisited', i."orgSettingsVisited",
            'profileVisitCount', i."profileVisitCount",
            'viewProfileClicked', i."viewProfileClicked",
            'homePageViewCount', i."homePageViewCount",
            'lastInteracted', i."lastInteracted"
          )
        ELSE NULL
      END as "interaction"
    FROM "User" u
    LEFT JOIN "UserAddress" a ON u."id" = a."userId"
    LEFT JOIN "UserEmail" e ON u."id" = e."userId"
    LEFT JOIN "UserInteraction" i ON u."id" = i."userId"
    WHERE u."username" = ${username}
    GROUP BY 
      u."id", 
      i."id", 
      i."userId", 
      i."finishSetupLinkClicked", 
      i."orgSettingsVisited", 
      i."profileVisitCount", 
      i."viewProfileClicked", 
      i."homePageViewCount", 
      i."lastInteracted"
    LIMIT 1;
  `

  return result?.[0] || null
}

export async function searchUsersByUsername({
  username,
}: {
  username: string
}) {
  return prisma.user.findMany({
    where: {
      username: {
        contains: username,
      },
    },
  })
}

export async function searchByAddress({
  address,
}: {
  address: string
}) {
  return prisma.user.findMany({
    where: {
      addresses: {
        some: {
          address: {
            contains: address,
          },
        },
      },
    },
  })
}

export async function searchByEmail({
  email,
}: {
  email: string
}) {

  // Only search if it's a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return []
  }

  return prisma.user.findMany({
    where: {
      emails: {
        some: {
          email: {
            contains: email,
          },
        },
      },
    },
  })
}

export async function upsertUser({
  farcasterId,
  ...user
}: {
  farcasterId?: string | null
  name?: string | null
  username?: string | null
  imageUrl?: string | null
  bio?: string | null
  privyDid?: string | null
}) {
  // If farcasterId is not provided, create a new user without it
  if (!farcasterId) {
    return prisma.user.create({
      data: user as Prisma.UserCreateInput,
      include: {
        emails: true,
      },
    })
  }

  return prisma.user.upsert({
    where: {
      farcasterId,
    },
    update: {
      ...user,
    },
    create: {
      farcasterId,
      ...user,
    },
    include: {
      emails: true,
    },
  })
}

export async function deleteUserEmails(uid: string) {
  try {
    await prisma.userEmail.deleteMany({
      where: {
        userId: uid,
      },
    })
  } catch (error) {
    console.error("Failed to delete emails:", error)
  }
}

export async function updateUserEmail({
  id,
  email,
  verified,
}: {
  id: string
  email?: string | null
  verified?: boolean
}) {
  const currentEmail = await prisma.userEmail.findFirst({
    where: {
      userId: id,
    },
  })
  const deleteEmails = currentEmail
    ? [
      prisma.userEmail.delete({
        where: {
          id: currentEmail.id,
        },
      }),
    ]
    : []

  const createEmail = email
    ? [
      prisma.userEmail.create({
        data: {
          email,
          userId: id,
          verified: verified ?? false,
        },
      }),
    ]
    : []

  return prisma.$transaction([...deleteEmails, ...createEmail])
}

export async function addUserAddresses({
  id,
  addresses,
  source,
}: {
  id: string
  addresses: string[]
  source: UserAddressSource
}) {
  return prisma.userAddress.createMany({
    data: addresses.map((address) => ({
      userId: id,
      address,
      source,
    })),
  })
}

export async function removeUserAddress({
  id,
  address,
}: {
  id: string
  address: string
}) {
  return prisma.userAddress.delete({
    where: {
      address_userId: {
        address,
        userId: id,
      },
    },
  })
}

export async function updateUserInteraction(
  userId: string,
  data: Prisma.UserInteractionUncheckedCreateInput,
) {
  return await prisma.userInteraction.upsert({
    where: { userId },
    update: {
      ...data,
      ...(data.homePageViewCount && { homePageViewCount: { increment: 1 } }),
      ...(data.profileVisitCount && { profileVisitCount: { increment: 1 } }),
    },
    create: { ...data, userId },
  })
}

export async function getAllCitizens(
  records: ExtendedAggregatedType["citizen"],
) {
  return prisma.userAddress.findMany({
    where: {
      AND: [
        {
          address: {
            in: records.map((record) => record.address),
          },
        },
      ],
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

export async function getAllBadgeholders() {
  return []
}

export async function getAllS7GovContributors(
  records: AggregatedType["gov_contribution"],
) {
  const round7Addresses = records.filter(
    (record) => record.metadata.round === 7,
  )

  return prisma.userAddress.findMany({
    where: {
      AND: [
        {
          address: {
            in: round7Addresses.map((record) => record.address),
          },
        },
      ],
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

export async function getAllRFVoters(
  records: ExtendedAggregatedType["rf_voter"],
) {
  const guestVoters = records.filter(
    (record) => record.metadata.voter_type === "Guest",
  )

  return prisma.userAddress.findMany({
    where: {
      address: {
        in: guestVoters.map((record) => record.address),
      },
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

export async function getAllContributors() {
  const [projectContributors, orgContributors] = await Promise.all([
    prisma.userProjects.findMany({
      where: {
        projectId: {
          in: CONTRIBUTOR_ELIGIBLE_PROJECTS,
        },
        deletedAt: null,
        user: {
          deletedAt: null,
        },
      },
      select: {
        user: {
          select: {
            emails: {
              orderBy: {
                createdAt: "desc",
              },
              select: {
                email: true,
              },
              where: {
                email: {
                  not: "",
                },
              },
            },
            addresses: {
              select: {
                address: true,
              },
            },
          },
        },
      },
    }),

    prisma.projectOrganization.findMany({
      where: {
        projectId: {
          in: CONTRIBUTOR_ELIGIBLE_PROJECTS,
        },
        deletedAt: null,
        organization: {
          deletedAt: null,
          team: {
            some: {
              deletedAt: null,
              user: {
                deletedAt: null,
              },
            },
          },
        },
      },
      select: {
        organization: {
          select: {
            team: {
              select: {
                user: {
                  select: {
                    emails: {
                      orderBy: {
                        createdAt: "desc",
                      },
                      select: {
                        email: true,
                      },
                      where: {
                        email: {
                          not: "",
                        },
                      },
                    },
                    addresses: {
                      select: {
                        address: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  const formattedProjectContributors = projectContributors.map(
    (contributor) => contributor.user,
  )

  const formattedOrgContributors = orgContributors.flatMap((org) =>
    org.organization.team.map((uo) => uo.user),
  )

  const mergedContributors = [
    ...formattedProjectContributors,
    ...formattedOrgContributors,
  ]

  const uniqueContributors = Array.from(
    new Map(
      mergedContributors.map((user) => [user.emails.at(0)?.email, user]),
    ).values(),
  )

  return uniqueContributors
}

export async function getAllOnchainBuilders() {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          projects: {
            some: {
              deletedAt: null,
              project: {
                contracts: {
                  some: {},
                },
                deletedAt: null,
              },
            },
          },
        },
        {
          organizations: {
            some: {
              deletedAt: null,
              organization: {
                deletedAt: null,
                projects: {
                  some: {
                    deletedAt: null,
                    project: {
                      contracts: {
                        some: {},
                      },
                      deletedAt: null,
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
    select: {
      addresses: {
        select: {
          address: true,
        },
      },
      emails: {
        select: {
          email: true,
        },
      },
    },
  })
}
export async function getAllGithubRepoBuiulders() {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          projects: {
            some: {
              deletedAt: null,
              project: {
                deletedAt: null,
                repos: {
                  some: {
                    verified: true,
                  },
                },
              },
            },
          },
        },
        {
          organizations: {
            some: {
              deletedAt: null,
              organization: {
                deletedAt: null,
                projects: {
                  some: {
                    deletedAt: null,
                    project: {
                      deletedAt: null,
                      repos: {
                        some: {
                          verified: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
    select: {
      addresses: {
        select: {
          address: true,
        },
      },
      emails: {
        select: {
          email: true,
        },
      },
    },
  })
}

export async function addTags(records: EntityRecords) {
  const entityKeys = Object.keys(records) as (keyof typeof records)[]
  const userTagsMap = new Map<string, Set<string>>()

  // Aggregate base tags from EntityRecords
  entityKeys.forEach((entity) => {
    records[entity].forEach((user) => {
      const tag = EXTENDED_TAG_BY_ENTITY[entity]
      if (!userTagsMap.has(user.email)) {
        userTagsMap.set(user.email, new Set([tag]))
      } else {
        userTagsMap.get(user.email)!.add(tag)
      }
    })
  })

  // Enrich with reward/org/project admin metadata
  const [allProjects, latestTranche] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        applications: { include: { round: true } },
        recurringRewards: true,
        team: { include: { user: { include: { emails: true } } } },
        organization: {
          include: {
            organization: {
              include: {
                team: { include: { user: { include: { emails: true } } } },
              },
            },
          },
        },
      },
    }),
    prisma.recurringReward.findFirst({
      orderBy: {
        tranche: "desc",
      },
      select: {
        tranche: true,
      },
    }),
  ])

  allProjects.forEach((project) => {
    const round7 = project.recurringRewards.find(
      (r) => (r.roundId === "7" && r.tranche == latestTranche?.tranche) ?? 1,
    )
    const round8 = project.recurringRewards.find(
      (r) => (r.roundId === "8" && r.tranche == latestTranche?.tranche) ?? 1,
    )

    const appliedRound7 = project.applications.some((a) => a.roundId === "7")
    const appliedRound8 = project.applications.some((a) => a.roundId === "8")

    const projectAdminEmails = project.team
      .filter((t) => t.role === "admin")
      .flatMap((t) => t.user.emails.map((e) => e.email))
    const orgAdminEmails =
      project.organization?.organization?.team
        .filter((t) => t.role === "admin")
        .flatMap((t) => t.user.emails.map((e) => e.email)) ?? []

    const allAdmins = new Set([...projectAdminEmails, ...orgAdminEmails])

    Array.from(allAdmins).forEach((email) => {
      if (!userTagsMap.has(email)) {
        userTagsMap.set(email, new Set())
      }

      const tags = userTagsMap.get(email)!

      if (round8) {
        tags.add("Received rewards (onchain builders)")
      } else if (appliedRound8) {
        tags.add("Did not receive rewards (onchain builders)")
      }

      if (round7) {
        tags.add("Received rewards (dev tooling)")
      } else if (appliedRound7) {
        tags.add("Did not receive rewards (dev tooling)")
      }
    })
  })

  // Add KYC tags
  const kycUsers = await prisma.kYCUser.findMany({
    where: {
      status: { in: ["PENDING", "APPROVED"] },
    },
  })

  kycUsers.forEach((kycUser) => {
    const email = kycUser.email

    if (!userTagsMap.has(email)) {
      userTagsMap.set(email, new Set())
    }

    const tags = userTagsMap.get(email)!

    if (kycUser.status === "APPROVED") {
      tags.add("KYC Cleared")
      tags.delete("KYC Started")
    } else if (kycUser.status === "PENDING") {
      tags.add("KYC Started")
    }
  })

  // Determine changes
  const newEmails = Array.from(userTagsMap.keys())

  const existingRecords = await prisma.contactEmailTags.findMany({
    where: {
      email: { in: newEmails },
    },
  })

  const existingTagMap = new Map<string, string[]>()
  existingRecords.forEach((record) => {
    existingTagMap.set(record.email, record.tags)
  })

  const emailsToUpsert: { email: string; tags: string[] }[] = []

  Array.from(userTagsMap.entries()).forEach(([email, newTagsSet]) => {
    const newTags = Array.from(newTagsSet).sort()
    const existingTags = existingTagMap.get(email)?.slice().sort() ?? []

    const areSame =
      newTags.length === existingTags.length &&
      newTags.every((tag, i) => tag === existingTags[i])

    if (!areSame) {
      emailsToUpsert.push({ email, tags: newTags })
    }
  })

  // Determine deletions
  const existingEmails = new Set(existingRecords.map((r) => r.email))
  const emailsToRemove = Array.from(existingEmails).filter(
    (email) => !userTagsMap.has(email),
  )

  // Apply updates in batches
  const BATCH_SIZE = 100
  for (let i = 0; i < emailsToUpsert.length; i += BATCH_SIZE) {
    const batch = emailsToUpsert.slice(i, i + BATCH_SIZE)

    const tx = batch.map(({ email, tags }) =>
      prisma.contactEmailTags.upsert({
        where: { email },
        create: { email, tags },
        update: { tags },
      }),
    )

    await prisma.$transaction(tx)
    console.log(`Processed batch ${i / BATCH_SIZE + 1}`)
  }

  if (emailsToRemove.length > 0) {
    await prisma.contactEmailTags.deleteMany({
      where: {
        email: { in: emailsToRemove },
      },
    })
  }

  // Final output for downstream use
  return emailsToUpsert.map(({ email, tags }) => ({ email, tags }))
}

export async function makeUserAddressPrimary(address: string, userId: string) {
  const existingPrimary = await prisma.userAddress.findFirst({
    where: {
      primary: true,
      userId,
    },
  })
  if (existingPrimary) {
    await prisma.userAddress.update({
      where: {
        address_userId: {
          address: existingPrimary.address,
          userId,
        },
      },
      data: {
        primary: false,
      },
    })
  }

  await prisma.userAddress.update({
    where: {
      address_userId: {
        address,
        userId,
      },
    },
    data: {
      primary: true,
    },
  })
}

export async function updateUser({
  id,
  ...user
}: {
  id: string
  farcasterId?: string | null
  name?: string | null
  username?: string | null
  imageUrl?: string | null
  bio?: string | null
  privyDid?: string | null
  discord?: string | null
  github?: string | null
  notDeveloper?: boolean
  govForumProfileUrl?: string | null
}) {
  return prisma.user.update({
    where: { id },
    data: user,
    include: {
      emails: true,
    },
  })
}

export async function createUser(privyDid: string) {
  return prisma.user.create({
    data: {
      privyDid,
      username: generateTemporaryUsername(privyDid),
    }
  })
}
