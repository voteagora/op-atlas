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

async function getAdminProjects(userName: string, roundId: string) {
  const user = await prisma.user.findFirst({
    where: {
      username: userName,
    },
  })
  if (!user) {
    throw new Error("User not found")
  }
  const teams = await getUserAdminProjectsWithDetail({
    userId: user.id,
    roundId,
  })
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
    throw new Error("User has no projects")
  }

  const rewards = userProjects.map((project) => ({
    id: Math.random().toString(36).substring(7), // Random ID
    projectId: project.id,
    amount: 1000000,
    roundId,
  }))

  return insertRewards(rewards)
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
