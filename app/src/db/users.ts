"use server"

import {
  Prisma,
  User,
  UserAddress,
  UserEmail,
  UserInteraction,
} from "@prisma/client"
import { AggregatedType } from "eas-indexer/src/types"

import { CONTRIBUTOR_ELIGIBLE_PROJECTS } from "@/lib/constants"
import { EXTENDED_TAG_BY_ENTITY } from "@/lib/constants"
import { ExtendedAggregatedType } from "@/lib/types"
import { UserAddressSource } from "@/lib/types"
import { mergeResultsByEmail } from "@/lib/utils/tags"

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
  return prisma.user.findUnique({
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

export async function upsertUser({
  farcasterId,
  ...user
}: {
  farcasterId: string
  name?: string | null
  username?: string | null
  imageUrl?: string | null
  bio?: string | null
}) {
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

export async function updateUserEmail({
  id,
  email,
}: {
  id: string
  email?: string | null
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
          },
        }),
      ]
    : []

  return prisma.$transaction([...deleteEmails, ...createEmail])
}

export async function updateUserHasGithub({
  id,
  notDeveloper = false,
}: {
  id: string
  notDeveloper?: boolean
}) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      notDeveloper,
    },
  })
}

export async function updateUserDiscord({
  id,
  discord,
}: {
  id: string
  discord?: string | null
}) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      discord,
    },
  })
}

export async function updateUserGithub({
  id,
  github,
}: {
  id: string
  github?: string | null
}) {
  const updates: Partial<User> = {
    github,
  }
  if (github) {
    updates.notDeveloper = false
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: updates,
  })
}

export async function updateUserGovForumProfileUrl({
  id,
  govForumProfileUrl,
}: {
  id: string
  govForumProfileUrl?: string | null
}) {
  return prisma.user.update({
    where: { id },
    data: { govForumProfileUrl },
  })
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

  // Handle base tag assignment from records
  entityKeys.forEach((entity) => {
    records[entity].forEach((user) => {
      const userTag = EXTENDED_TAG_BY_ENTITY[entity]
      if (!userTagsMap.has(user.email)) {
        userTagsMap.set(user.email, new Set([userTag]))
      } else {
        userTagsMap.get(user.email)?.add(userTag)
      }
    })
  })

  // Fetch project + org data
  const allProjects = await prisma.project.findMany({
    where: { deletedAt: null },
    include: {
      applications: {
        include: { round: true },
      },
      rewards: {
        include: { round: true },
      },
      team: {
        include: {
          user: { include: { emails: true } },
        },
      },
      organization: {
        include: {
          organization: {
            include: {
              team: {
                include: {
                  user: { include: { emails: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  for (const project of allProjects) {
    const round7 = project.rewards.find((r) => r.roundId === "7")
    const round8 = project.rewards.find((r) => r.roundId === "8")

    const appliedRound7 = project.applications.some((app) =>
      app.round.name.includes("7"),
    )
    const appliedRound8 = project.applications.some((app) =>
      app.round.name.includes("8"),
    )

    const projectAdminEmails = project.team
      .filter((team) => team.role === "admin")
      .flatMap((team) => team.user.emails.map((e) => e.email))

    const orgAdminEmails =
      project.organization?.organization?.team
        .filter((team) => team.role === "admin")
        .flatMap((team) => team.user.emails.map((e) => e.email)) ?? []

    const allAdminEmails = Array.from(
      new Set([...projectAdminEmails, ...orgAdminEmails]),
    ).filter(Boolean)

    for (const email of allAdminEmails) {
      if (!userTagsMap.has(email)) {
        userTagsMap.set(email, new Set())
      }

      const tags = userTagsMap.get(email)!

      if (round8 && round8.amount.toNumber() > 0) {
        tags.add("Received rewards (onchain builders)")
      } else if (appliedRound8) {
        tags.add("Did not receive rewards (onchain builders)")
      }

      if (round7 && round7.amount.toNumber() > 0) {
        tags.add("Received rewards (dev tooling)")
      } else if (appliedRound7) {
        tags.add("Did not receive rewards (dev tooling)")
      }
    }
  }

  const emailsToUpdate = Array.from(userTagsMap.keys())

  const usersToUpdate = await prisma.userEmail.findMany({
    where: {
      email: {
        in: emailsToUpdate,
      },
    },
  })

  const usersToUntagCondition = {
    AND: [
      {
        NOT: {
          tags: {
            isEmpty: true,
          },
        },
      },
      {
        email: {
          notIn: emailsToUpdate,
        },
      },
    ],
  }

  const usersToUntag = await prisma.userEmail.findMany({
    where: usersToUntagCondition,
  })

  await prisma.$transaction([
    ...usersToUpdate.map((user) =>
      prisma.userEmail.update({
        where: { id: user.id },
        data: { tags: Array.from(userTagsMap.get(user.email) ?? []) },
      }),
    ),
    prisma.userEmail.updateMany({
      where: usersToUntagCondition,
      data: { tags: [] },
    }),
  ])

  return [
    ...usersToUpdate.map((user) => ({
      id: user.id,
      email: user.email,
      tags: Array.from(userTagsMap.get(user.email) ?? []),
    })),
    ...usersToUntag.map((user) => ({
      id: user.id,
      email: user.email,
      tags: [],
    })),
  ]
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
