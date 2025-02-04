"use server"

import {
  Prisma,
  User,
  UserAddress,
  UserEmail,
  UserInteraction,
} from "@prisma/client"
import { CONTRIBUTOR_ELIGIBLE_PROJECTS } from "eas-indexer/src/constants"
import { TAG_BY_ENTITY } from "eas-indexer/src/constants"
import { AggregatedType } from "eas-indexer/src/types"

import { UserAddressSource } from "@/lib/types"
import { mergeResultsByEmail } from "@/lib/utils/tags"

import { prisma } from "./client"

export type Entity = keyof AggregatedType
export type EntityObject = {
  address: string
  email: string
}
export type EntityRecords = Record<Entity, EntityObject[]>

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      addresses: true,
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
  const deleteEmails = prisma.userEmail.deleteMany({
    where: {
      userId: id,
    },
  })

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

  return prisma.$transaction([deleteEmails, ...createEmail])
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

export async function getAllCitizens(records: AggregatedType["citizen"]) {
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

export async function getAllGovContributors(
  records: AggregatedType["gov_contribution"],
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

export async function getAllRFVoters(records: AggregatedType["rf_voter"]) {
  return prisma.userAddress.findMany({
    where: {
      address: {
        in: records.map((record) => record.address),
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

export async function getAllContributors(
  records: AggregatedType["contributors"],
) {
  const data = await prisma.project.findMany({
    where: {
      id: {
        in: CONTRIBUTOR_ELIGIBLE_PROJECTS,
      },
    },
    select: {
      team: {
        select: {
          user: {
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
          },
        },
      },
      organization: {
        select: {
          project: {
            select: {
              team: {
                select: {
                  user: {
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
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const mergedContributors = data
    .flatMap((d) => {
      const team = d.team.map((t) => ({
        user: t.user,
        organization: null,
      }))

      const organization =
        d.organization?.project.team.map((t) => ({
          user: t.user,
          organization: d.organization,
        })) ?? []

      return [...team, ...organization]
    })
    .flatMap((c) => {
      const mergedUsers = [
        c.user,
        ...(c.organization?.project.team.map((t) => t.user) ?? []),
      ]
      const uniqueUsers = Array.from(
        new Set(mergedUsers.map((u) => u.emails.at(-1)?.email)),
      ).map((email) => {
        return mergedUsers.find((u) => u.emails.at(-1)?.email === email)
      })

      return uniqueUsers
    })

  return mergedContributors
}

export async function getAllOnchainBuilders() {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          projects: {
            some: {
              project: {
                contracts: {
                  some: {},
                },
              },
            },
          },
        },
        {
          organizations: {
            some: {
              organization: {
                projects: {
                  some: {
                    project: {
                      contracts: {
                        some: {},
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
export async function getAllGithubRepoBuiulders() {
  return prisma.user.findMany({
    where: {
      OR: [
        {
          projects: {
            some: {
              project: {
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
              organization: {
                projects: {
                  some: {
                    project: {
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
export async function getAllCommunityContributors(addresses: string[]) {
  return prisma.userAddress.findMany({
    where: {
      address: {
        in: addresses,
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

export async function addTag(addresses: EntityObject[], tag: Entity) {
  if (addresses.length === 0) {
    return
  }

  let updatedUserTag = TAG_BY_ENTITY[tag] || ""
  if (!updatedUserTag) {
    console.error("Invalid tag")
    return
  }

  const usersToUpdate = await prisma.userEmail.findMany({
    where: {
      email: {
        in: addresses.map((a) => a.email),
      },
      NOT: {
        tags: {
          has: updatedUserTag,
        },
      },
    },
    select: {
      email: true,
      tags: true,
    },
  })

  if (usersToUpdate.length === 0) {
    return await prisma.userEmail.findMany({
      where: {
        email: {
          in: addresses.map((a) => a.email),
        },
      },
      select: {
        email: true,
        tags: true,
      },
    })
  }

  await prisma.userEmail.updateMany({
    where: {
      email: {
        in: usersToUpdate.map((u) => u.email),
      },
    },
    data: {
      tags: {
        push: updatedUserTag,
      },
    },
  })

  const updatedUsersTags = await prisma.userEmail.findMany({
    where: {
      email: {
        in: usersToUpdate.map((u) => u.email),
      },
    },
    select: {
      email: true,
      tags: true,
    },
  })

  return mergeResultsByEmail([updatedUsersTags])
}

export async function removeTags(addresses: EntityRecords, tags: Entity[]) {
  if (
    !tags.length ||
    Object.values(addresses).every((list) => list.length === 0)
  )
    return

  const tagsToRemove = tags.map((tag) => TAG_BY_ENTITY[tag]).filter(Boolean)
  if (!tagsToRemove.length) return

  const emailsToUpdate = Array.from(
    new Set(
      Object.values(addresses)
        .flat()
        .map((a) => a.email),
    ),
  )
  const usersToUpdate = await prisma.userEmail.findMany({
    where: {
      email: { in: emailsToUpdate },
      tags: { hasSome: tagsToRemove },
    },
    select: {
      id: true,
      email: true,
      tags: true,
    },
  })

  await prisma.$transaction(
    usersToUpdate.map((user) =>
      prisma.userEmail.update({
        where: { id: user.id },
        data: {
          tags: { set: user.tags.filter((t) => !tagsToRemove.includes(t)) },
        },
      }),
    ),
  )

  return await prisma.userEmail.findMany({
    where: { email: { in: emailsToUpdate } },
    select: { email: true, tags: true },
  })
}
