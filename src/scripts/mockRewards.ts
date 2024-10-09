import { prisma } from "@/db/client"

async function getUserAdminProjectsWithDetail({
  userId,
  roundId,
}: {
  userId: string
  roundId?: string
}) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      projects: {
        where: {
          deletedAt: null,
          role: "admin",
          project: {
            deletedAt: null,
          },
        },
        include: {
          project: {
            include: {
              team: { where: { deletedAt: null }, include: { user: true } },
              repos: true,
              contracts: true,
              funding: true,
              snapshots: true,
              organization: {
                where: { deletedAt: null, organization: { deletedAt: null } },
                include: {
                  organization: {
                    include: {
                      team: {
                        where: { deletedAt: null },
                        include: { user: true },
                      },
                    },
                  },
                },
              },
              applications: {
                where: {
                  roundId,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
              links: true,
              rewards: { include: { claim: true } },
            },
          },
        },
        orderBy: {
          project: {
            createdAt: "asc",
          },
        },
      },
      organizations: {
        where: {
          deletedAt: null,
          role: "admin",
          organization: { deletedAt: null },
        },
        select: {
          organization: {
            include: {
              projects: {
                where: { deletedAt: null, project: { deletedAt: null } },
                include: {
                  project: {
                    include: {
                      team: {
                        where: { deletedAt: null },
                        include: { user: true },
                      },
                      repos: true,
                      contracts: true,
                      funding: true,
                      snapshots: true,
                      organization: {
                        where: { deletedAt: null },
                        include: {
                          organization: {
                            include: {
                              team: {
                                where: { deletedAt: null },
                                include: { user: true },
                              },
                            },
                          },
                        },
                      },
                      applications: {
                        where: {
                          roundId,
                        },
                        orderBy: {
                          createdAt: "desc",
                        },
                      },
                      links: true,
                      rewards: { include: { claim: true } },
                    },
                  },
                },
                orderBy: {
                  project: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

async function getAdminProjects(userId: string, roundId: string) {
  const teams = await getUserAdminProjectsWithDetail({ userId, roundId })
  const teamProjects = teams?.projects.map(({ project }) => project) ?? []
  const organizationProjects =
    teams?.organizations
      .map(({ organization }) => organization.projects)
      .flat()
      .map(({ project }) => project) ?? []

  // Filter out duplicates
  const organizationProjectIds = organizationProjects.map(({ id }) => id)
  const filteredTeamProjects = teamProjects.filter(
    ({ id }) => !organizationProjectIds.includes(id),
  )
  return [...filteredTeamProjects, ...organizationProjects]
}

async function insertRewards(
  rewards: {
    id: string
    projectId: string
    amount: number
    roundId: string
  }[],
) {
  return prisma.fundingReward.createMany({
    data: rewards.map((reward) => ({
      ...reward,
    })),
    skipDuplicates: true,
  })
}

async function injestMockreward({
  userName,
  roundId,
}: {
  userName: string
  roundId: string
}) {
  const userProjects = await getAdminProjects(userName, roundId)

  if (!userProjects.length) {
    return {
      error: "User has no projects",
    }
  }

  const projectId = userProjects[0].id

  return insertRewards([
    {
      id: Math.random().toString(36).substring(7), // Random ID
      projectId,
      amount: 1000000,
      roundId,
    },
  ])
}

injestMockreward({
  userName: "arsent",
  roundId: "5",
})
  .then(() => {
    console.log("Done")
  })
  .catch((error) => {
    console.error("Error:", error)
  })
