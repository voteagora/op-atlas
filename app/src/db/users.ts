"use server"

import {
  Prisma,
  User,
  UserAddress,
  UserEmail,
  UserInteraction,
  UserPassport,
  UserSafeAddress,
} from "@prisma/client"
import type { PrismaClient } from "@prisma/client"
import type { Session } from "next-auth"
import { isSignedImpersonationSessionValid } from "@/lib/auth/impersonationSession"
import { AggregatedType } from "eas-indexer/src/types"
import { getAddress, isAddress } from "viem"

import { auth } from "@/auth"
import {
  CONTRIBUTOR_ELIGIBLE_PROJECTS,
  EXTENDED_TAG_BY_ENTITY,
} from "@/lib/constants"
import {
  ExtendedAggregatedType,
  UserAddressSource,
  UserWithAddresses,
} from "@/lib/types"
import { generateTemporaryUsername } from "@/lib/utils/username"

import { prisma } from "./client"

export type Entity = keyof ExtendedAggregatedType
export type EntityObject = {
  address: string
  email: string
}
export type EntityRecords = Record<
  Exclude<Entity, "badgeholder" | "votes">,
  EntityObject[]
>

export async function getUserById(
  userId: string,
  db: PrismaClient = prisma,
  sessionOverride?: Session | null,
) {
  const session = sessionOverride ?? (await auth())

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      addresses: {
        orderBy: {
          primary: "desc",
        },
      },
      emails: true,
      safeAddresses: true,
      citizen: true,
    },
  })

  // If user is not logged in or requesting different user's data (and not an authorized admin impersonation),
  // remove sensitive information but keep shape consistent.
  const isAuthorizedImpersonationTarget = !!session?.impersonation &&
    isSignedImpersonationSessionValid(session.impersonation as any, {
      currentAdminUserId: session.user?.id,
    }) &&
    (session.impersonation as any).targetUserId === userId

  const isSelfOrAuthorizedTarget = !!session?.user && (
    session.user.id === userId || isAuthorizedImpersonationTarget
  )

  if (!isSelfOrAuthorizedTarget && user) {
    user.emails = []
    user.safeAddresses = []
    user.privyDid = null
    user.createdAt = new Date(0)
    user.deletedAt = new Date(0)
    user.updatedAt = new Date(0)
    user.notDeveloper = false
    return user
  }

  return user
}

export async function getUserByPrivyDid(
  privyDid: string,
  db: PrismaClient = prisma,
): Promise<
  | (User & {
      addresses: UserAddress[]
      interaction: UserInteraction | null
      emails: UserEmail[]
    })
  | null
> {
  return db.user.findFirst({
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
      safeAddresses: true,
    },
  })
}

export async function getUserByAddress(
  address: string,
  db: PrismaClient = prisma,
): Promise<UserWithAddresses | null> {
  const user = await db.user.findFirst({
    where: {
      addresses: {
        some: {
          address,
        },
      },
    },
    include: {
      addresses: {
        orderBy: {
          primary: "desc",
        },
      },
      interaction: true,
      emails: true,
      safeAddresses: true,
    },
  })

  return user as UserWithAddresses | null
}

export async function getUserByEmail(
  email: string,
  db: PrismaClient = prisma,
): Promise<User | null> {
  const userEmail = await db.userEmail.findFirst({
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
          safeAddresses: true,
        },
      },
    },
  })

  return userEmail?.user || null
}

export async function getUserByFarcasterId(
  farcasterId: string,
  db: PrismaClient = prisma,
) {
  return db.user.findUnique({
    where: {
      farcasterId,
    },
    include: {
      addresses: true,
      emails: true,
      safeAddresses: true,
    },
  })
}

export async function getUserByUsername(
  username: string,
  db: PrismaClient = prisma,
): Promise<
  | (User & {
      addresses: UserAddress[]
      interaction: UserInteraction | null
      emails: UserEmail[]
      safeAddresses: UserSafeAddress[]
    })
  | null
> {
  const result = await db.$queryRaw<
    (User & {
      addresses: UserAddress[]
      interaction: UserInteraction | null
      emails: UserEmail[]
      safeAddresses: UserSafeAddress[]
    })[]
  >`
    SELECT 
      u.*,
      json_agg(DISTINCT a) FILTER (WHERE a."address" IS NOT NULL) as "addresses",
      json_agg(DISTINCT e) FILTER (WHERE e."email" IS NOT NULL) as "emails",
      json_agg(DISTINCT sa) FILTER (WHERE sa."safeAddress" IS NOT NULL) as "safeAddresses",
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
    LEFT JOIN "UserSafeAddresses" sa ON u."id" = sa."userId"
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

export async function searchUsersByUsername(
  {
    username,
  }: {
    username: string
  },
  db: PrismaClient = prisma,
) {
  return db.user.findMany({
    where: {
      username: {
        contains: username,
      },
    },
  })
}

export async function searchByAddress(
  { address }: { address: string },
  db: PrismaClient = prisma,
) {
  return db.user.findMany({
    where: {
      addresses: {
        some: {
          address: {
            contains: isAddress(address)
              ? (getAddress(address) as string)
              : address,
          },
        },
      },
    },
  })
}

export async function searchByEmail(
  { email }: { email: string },
  db: PrismaClient = prisma,
) {
  // Only search if it's a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return []
  }

  return db.user.findMany({
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

export async function upsertUser(
  {
    farcasterId,
    ...user
  }: {
    farcasterId?: string | null
    name?: string | null
    username?: string | null
    imageUrl?: string | null
    bio?: string | null
    privyDid?: string | null
  },
  db: PrismaClient = prisma,
) {
  // If farcasterId is not provided, create a new user without it
  if (!farcasterId) {
    return db.user.create({
      data: user as Prisma.UserCreateInput,
      include: {
        emails: true,
      },
    })
  }

  return db.user.upsert({
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

export async function deleteUserEmails(
  uid: string,
  db: PrismaClient = prisma,
) {
  try {
    // Only delete verified emails that don't have active verification processes
    // This preserves unverified emails with verification tokens (like KYC email verification)
    await db.userEmail.deleteMany({
      where: {
        userId: uid,
        verified: true,
        verificationToken: null,
        OR: [
          { verificationTokenExpiresAt: null },
          { verificationTokenExpiresAt: { lt: new Date() } }, // Expired tokens
        ],
      },
    })
  } catch (error) {
    console.error("Failed to delete emails:", error)
  }
}

export async function updateUserEmail(
  {
    id,
    email,
    verified,
  }: {
    id: string
    email?: string | null
    verified?: boolean
  },
  db: PrismaClient = prisma,
) {
  try {
    // If setting a new email (not clearing it)
    if (email) {
      // Check if this email is already in use by another user
      const existingEmailRecord = await db.userEmail.findUnique({
        where: { email },
        include: { user: true },
      })

      if (existingEmailRecord && existingEmailRecord.userId !== id) {
        // Delete the email from the old user
        try {
          await db.userEmail.delete({
            where: { email },
          })
        } catch (deleteError) {
          console.error(
            `[Auth] Failed to delete email from old user ${existingEmailRecord.userId}:`,
            deleteError,
          )
        }
      }
    }

    // Only delete verified emails that don't have pending verification tokens
    // This preserves unverified emails with verification tokens (like KYC email verification)
    const currentVerifiedEmail = await db.userEmail.findFirst({
      where: {
        userId: id,
        verified: true,
        verificationToken: null, // Only delete emails without pending verification
        OR: [
          { verificationTokenExpiresAt: null },
          { verificationTokenExpiresAt: { lt: new Date() } }, // Expired tokens
        ],
      },
    })

    const deleteEmails = currentVerifiedEmail
      ? [
          db.userEmail.delete({
            where: {
              id: currentVerifiedEmail.id,
            },
          }),
        ]
      : []

    const createEmail = email
      ? [
          db.userEmail.create({
            data: {
              email,
              userId: id,
              verified: verified ?? false,
            },
          }),
        ]
      : []

    return db.$transaction([...deleteEmails, ...createEmail])
  } catch (error) {
    console.error(`[Auth] Failed to update email for user ${id}:`, error)
    throw error
  }
}

export async function markUserEmailVerified(
  email: string,
  db: PrismaClient = prisma,
) {
  return db.userEmail.update({
    where: { email: email.toLowerCase() },
    data: { verified: true },
  })
}

export async function addUserAddresses(
  {
    id,
    addresses,
    source,
  }: {
    id: string
    addresses: string[]
    source: UserAddressSource
  },
  db: PrismaClient = prisma,
) {
  try {
    // Find all addresses that already exist and belong to other users
    const existingAddresses = await db.userAddress.findMany({
      where: {
        address: { in: addresses },
        userId: { not: id },
      },
    })

    // Delete them all in one query
    if (existingAddresses.length > 0) {
      await db.userAddress.deleteMany({
        where: {
          address: { in: existingAddresses.map((a) => a.address) },
        },
      })
    }

    // Now add all addresses to the current user
    return db.userAddress.createMany({
      data: addresses.map((address) => ({
        userId: id,
        address,
        source,
      })),
      skipDuplicates: true,
    })
  } catch (error) {
    console.error(`[Auth] Failed to add addresses for user ${id}:`, error)
    throw error
  }
}

export async function removeUserAddress(
  {
    id,
    address,
  }: {
    id: string
    address: string
  },
  db: PrismaClient = prisma,
) {
  return db.userAddress.delete({
    where: {
      address_userId: {
        address,
        userId: id,
      },
    },
  })
}

export async function addUserSafeAddress(
  {
    userId,
    safeAddress,
  }: {
    userId: string
    safeAddress: string
  },
  db: PrismaClient = prisma,
) {
  const formatted = getAddress(safeAddress)

  return db.userSafeAddress.upsert({
    where: {
      userId_safeAddress: {
        userId,
        safeAddress: formatted,
      },
    },
    create: {
      userId,
      safeAddress: formatted,
    },
    update: {},
  })
}

export async function removeUserSafeAddress(
  {
    userId,
    safeAddress,
  }: {
    userId: string
    safeAddress: string
  },
  db: PrismaClient = prisma,
) {
  return db.userSafeAddress.delete({
    where: {
      userId_safeAddress: {
        userId,
        safeAddress: getAddress(safeAddress),
      },
    },
  })
}

export async function updateUserInteraction(
  userId: string,
  data: Prisma.UserInteractionUncheckedCreateInput,
  db: PrismaClient = prisma,
) {
  return await db.userInteraction.upsert({
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
  db: PrismaClient = prisma,
) {
  return db.userAddress.findMany({
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
  db: PrismaClient = prisma,
) {
  const round7Addresses = records.filter(
    (record) => record.metadata.round === 7,
  )

  return db.userAddress.findMany({
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
  db: PrismaClient = prisma,
) {
  const guestVoters = records.filter(
    (record) => record.metadata.voter_type === "Guest",
  )

  return db.userAddress.findMany({
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

export async function getAllContributors(db: PrismaClient = prisma) {
  const [projectContributors, orgContributors] = await Promise.all([
    db.userProjects.findMany({
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

    db.projectOrganization.findMany({
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

export async function getAllOnchainBuilders(db: PrismaClient = prisma) {
  return db.user.findMany({
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
export async function getAllGithubRepoBuiulders(
  db: PrismaClient = prisma,
) {
  return db.user.findMany({
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

export async function addTags(
  records: EntityRecords,
  db: PrismaClient = prisma,
) {
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
    db.project.findMany({
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
    db.recurringReward.findFirst({
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
  const kycUsers = await db.kYCUser.findMany({
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

  const existingRecords = await db.contactEmailTags.findMany({
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
      db.contactEmailTags.upsert({
        where: { email },
        create: { email, tags },
        update: { tags },
      }),
    )

    await db.$transaction(tx)
    console.log(`Processed batch ${i / BATCH_SIZE + 1}`)
  }

  if (emailsToRemove.length > 0) {
    await db.contactEmailTags.deleteMany({
      where: {
        email: { in: emailsToRemove },
      },
    })
  }

  // Final output for downstream use
  return emailsToUpsert.map(({ email, tags }) => ({ email, tags }))
}

export async function makeUserAddressPrimary(
  address: string,
  userId: string,
  db: PrismaClient = prisma,
  sessionOverride?: Session | null,
) {
  const user = await getUserById(userId, db, sessionOverride)

  if (!user) {
    throw new Error("User not found")
  }

  const existingPrimary = user.addresses.find((addr) => addr.primary)?.address

  if (existingPrimary) {
    await db.userAddress.update({
      where: {
        address_userId: {
          address: existingPrimary,
          userId,
        },
      },
      data: {
        primary: false,
      },
    })
  }

  await db.userAddress.update({
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

export async function updateUser(
  {
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
    twitter?: string | null
    notDeveloper?: boolean
    govForumProfileUrl?: string | null
    emailNotifEnabled?: boolean
  },
  db: PrismaClient = prisma,
) {
  return db.user.update({
    where: { id },
    data: user,
    include: {
      emails: true,
    },
  })
}

export async function updateUserFarcasterId(
  {
    userId,
    farcasterId,
    name,
    username,
    imageUrl,
    bio,
  }: {
    userId: string
    farcasterId: string | null
    name?: string | null
    username?: string | null
    imageUrl?: string | null
    bio?: string | null
  },
  db: PrismaClient = prisma,
) {
  try {
    // If trying to set a farcasterId (not clearing it)
    if (farcasterId) {
      // Check if this farcasterId is already in use by another user
      const existingUserWithFid = await getUserByFarcasterId(farcasterId, db)

      if (existingUserWithFid && existingUserWithFid.id !== userId) {
        // Clear the farcasterId from the old user
        try {
          await db.user.update({
            where: { id: existingUserWithFid.id },
            data: {
              farcasterId: null,
              name: null,
              username: generateTemporaryUsername(
                existingUserWithFid.privyDid!,
              ),
              imageUrl: null,
              bio: null,
            },
          })
        } catch (clearError) {
          console.error(
            `[Auth] Failed to clear farcasterId from old user ${existingUserWithFid.id}:`,
            clearError,
          )
        }
      }
    }

    // Now update the target user with the farcasterId
    return await db.user.update({
      where: { id: userId },
      data: {
        farcasterId,
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(bio !== undefined && { bio }),
      },
      include: {
        emails: true,
        addresses: true,
      },
    })
  } catch (error) {
    console.error(
      `[Auth] Failed to update farcasterId for user ${userId}:`,
      error,
    )
    throw error
  }
}

export async function createUser(
  privyDid: string,
  db: PrismaClient = prisma,
) {
  return db.user.create({
    data: {
      privyDid,
      username: generateTemporaryUsername(privyDid),
    },
  })
}

export async function upsertUserPassport(
  {
    userId,
    passport,
  }: {
    userId: string
    passport: {
      score: number
      expiresAt: Date
      address: string
    }
  },
  db: PrismaClient = prisma,
) {
  // Check if a passport for that address already exists
  const existingPassport = await db.userPassport.findFirst({
    where: {
      userId,
      address: passport.address,
    },
  })

  // Delete existing record if it exists
  if (existingPassport) {
    await db.userPassport.delete({
      where: {
        id: existingPassport.id,
      },
    })
  }

  // Create new record
  return db.userPassport.create({
    data: {
      userId,
      score: passport.score,
      address: passport.address,
      expiresAt: passport.expiresAt,
    },
  })
}

export async function getUserPassports(
  userId: string,
  db: PrismaClient = prisma,
): Promise<UserPassport[]> {
  return db.userPassport.findMany({
    where: {
      userId,
    },
  })
}

export async function deleteUserPassport(id: number, db: PrismaClient = prisma) {
  return db.userPassport.delete({
    where: { id },
  })
}

export async function getUserWorldId(
  userId: string,
  db: PrismaClient = prisma,
) {
  return db.userWorldId.findFirst({
    where: {
      userId,
    },
  })
}

export async function upsertUserWorldId(
  {
    userId,
    nullifierHash,
    verified = false,
  }: {
    userId: string
    nullifierHash: string
    verified?: boolean
  },
  db: PrismaClient = prisma,
) {
  return db.userWorldId.upsert({
    where: {
      userId,
    },
    update: {
      nullifierHash,
      verified,
      updatedAt: new Date(),
    },
    create: {
      userId,
      nullifierHash,
      verified,
    },
  })
}
