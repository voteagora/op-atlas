"use server"

import { Prisma, Project } from "@prisma/client"
import { cache } from "react"

import { ApplicationWithDetails, TeamRole } from "@/lib/types"
import { ProjectMetadata } from "@/lib/utils/metadata"

import { prisma } from "./client"

async function getUserProjectsFn({ farcasterId }: { farcasterId: string }) {
  return prisma.user.findUnique({
    where: {
      farcasterId,
    },
    select: {
      projects: {
        where: {
          deletedAt: null,
          project: {
            deletedAt: null,
          },
        },
        include: {
          project: true,
        },
      },
    },
  })
}

export const getUserProjects = cache(getUserProjectsFn)

async function getUserAdminProjectsWithDetailFn({
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
          role: "admin" satisfies TeamRole,
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
          role: "admin" satisfies TeamRole,
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

export const getUserAdminProjectsWithDetail = cache(
  getUserAdminProjectsWithDetailFn,
)

const getRandomProjectsFn = () => {
  return prisma.$queryRaw<Project[]>`
    SELECT * 
    FROM "Project" 
    WHERE "deletedAt" IS NULL 
    AND "thumbnailUrl" IS NOT NULL 
    ORDER BY RANDOM() 
    LIMIT 5;
  `
}

export const getRandomProjects = cache(getRandomProjectsFn)

async function getUserProjectsWithDetailsFn({ userId }: { userId: string }) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      projects: {
        where: {
          deletedAt: null,
          project: {
            deletedAt: null,
            organization: {
              is: null,
            },
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
              applications: true,
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
  })
}

export const getUserProjectsWithDetails = cache(getUserProjectsWithDetailsFn)

export type CreateProjectParams = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt" | "deletedAt">
> & {
  name: string
}

export async function createProject({
  userId,
  projectId,
  organizationId,
  project,
}: {
  userId: string
  projectId: string
  organizationId?: string
  project: CreateProjectParams
}) {
  return prisma.project.create({
    data: {
      id: projectId,
      ...project,
      team: {
        create: [
          {
            role: "admin" satisfies TeamRole,
            user: {
              connect: {
                id: userId,
              },
            },
          },
          ...(organizationId
            ? await prisma.userOrganization
                .findMany({
                  where: { organizationId, deletedAt: null },
                  select: { userId: true },
                })
                .then((members) =>
                  members
                    .filter((member) => member.userId !== userId)
                    .map((member) => ({
                      role: "member",

                      user: {
                        connect: {
                          id: member.userId,
                        },
                      },
                    })),
                )
            : []),
        ],
      },
      organization: organizationId
        ? {
            create: {
              organization: {
                connect: {
                  id: organizationId,
                },
              },
            },
          }
        : undefined,
    },
  })
}

export type UpdateProjectParams = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt" | "deletedAt">
>

export async function updateProject({
  id,
  project,
}: {
  id: string
  project: UpdateProjectParams
}) {
  return prisma.project.update({
    where: {
      id,
    },
    data: {
      ...project,
      lastMetadataUpdate: new Date(),
    },
  })
}

export async function updateProjectOrganization({
  projectId,
  organizationId,
}: {
  projectId: string
  organizationId: string
}) {
  return prisma.projectOrganization.upsert({
    where: { projectId },
    update: { organizationId },
    create: { projectId, organizationId },
  })
}

export async function removeProjectOrganization({
  projectId,
}: {
  projectId: string
}) {
  return prisma.projectOrganization.deleteMany({
    where: { projectId },
  })
}

export async function deleteProject({ id }: { id: string }) {
  return prisma.project.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

async function getProjectFn({ id }: { id: string }) {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
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
      repos: true,
      contracts: true,
      links: true,
      funding: true,
      snapshots: {
        orderBy: {
          createdAt: "asc",
        },
      },
      applications: {
        include: {
          category: {
            include: {
              impactStatements: true,
            },
          },
          impactStatementAnswer: true,
          round: true,
        },
      },
      rewards: { include: { claim: true } },
    },
  })
}

export const getProject = cache(getProjectFn)

async function getProjectTeamFn({ id }: { id: string }) {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      team: {
        where: {
          deletedAt: null,
        },
      },
    },
  })
}

export const getProjectTeam = cache(getProjectTeamFn)

export async function addTeamMembers({
  projectId,
  userIds,
  role = "member",
}: {
  projectId: string
  userIds: string[]
  role?: TeamRole
}) {
  // There may be users who were previously soft deleted, so this is complex
  const deletedMembers = await prisma.userProjects.findMany({
    where: {
      projectId,
      userId: {
        in: userIds,
      },
    },
  })

  const updateMemberIds = deletedMembers.map((m) => m.userId)
  const createMemberIds = userIds.filter((id) => !updateMemberIds.includes(id))

  const memberUpdate = prisma.userProjects.updateMany({
    where: {
      projectId,
      userId: {
        in: updateMemberIds,
      },
    },
    data: {
      deletedAt: null,
    },
  })

  const memberCreate = prisma.userProjects.createMany({
    data: createMemberIds.map((userId) => ({
      role,
      userId,
      projectId,
    })),
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberUpdate, memberCreate, projectUpdate])
}

export async function updateMemberRole({
  projectId,
  userId,
  role,
}: {
  projectId: string
  userId: string
  role: TeamRole
}) {
  const memberUpdate = prisma.userProjects.update({
    where: {
      userId_projectId: {
        projectId,
        userId,
      },
    },
    data: {
      role,
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberUpdate, projectUpdate])
}

export async function removeTeamMember({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) {
  const memberDelete = prisma.userProjects.update({
    where: {
      userId_projectId: {
        projectId,
        userId,
      },
    },
    data: {
      role: "member",
      deletedAt: new Date(),
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberDelete, projectUpdate])
}

export async function addProjectContract({
  projectId,
  contract,
}: {
  projectId: string
  contract: Omit<Prisma.ProjectContractCreateInput, "project">
}) {
  const contractCreate = prisma.projectContract.create({
    data: {
      ...contract,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([contractCreate, projectUpdate])
}

export async function updateProjectContract({
  projectId,
  contractAddress,
  chainId,
  updates,
}: {
  projectId: string
  contractAddress: string
  chainId: number
  updates: Prisma.ProjectContractUpdateInput
}) {
  const contractUpdate = prisma.projectContract.update({
    where: {
      projectId,
      contractAddress_chainId: {
        contractAddress,
        chainId,
      },
    },
    data: updates,
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([contractUpdate, projectUpdate])
}

export async function removeProjectContract({
  projectId,
  address,
  chainId,
}: {
  projectId: string
  address: string
  chainId: number
}) {
  const contractDelete = prisma.projectContract.delete({
    where: {
      projectId,
      contractAddress_chainId: {
        contractAddress: address,
        chainId,
      },
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([contractDelete, projectUpdate])
}

async function getProjectContractsFn({
  projectId,
  deployerAddress,
}: {
  projectId: string
  deployerAddress: string
}) {
  return prisma.projectContract.findMany({
    where: {
      projectId,
      deployerAddress,
    },
    include: {
      project: true,
    },
  })
}

export const getProjectContracts = cache(getProjectContractsFn)

export async function addProjectRepository({
  projectId,
  repo,
}: {
  projectId: string
  repo: Omit<Prisma.ProjectRepositoryCreateInput, "project">
}) {
  const repoCreate = prisma.projectRepository.upsert({
    where: {
      url: repo.url,
      projectId,
    },
    update: {
      ...repo,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
    create: {
      ...repo,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  const [repository, project] = await prisma.$transaction([
    repoCreate,
    projectUpdate,
  ])

  return repository
}

export async function removeProjectRepository({
  projectId,
  repositoryUrl,
}: {
  projectId: string
  repositoryUrl: string
}) {
  const repoDelete = prisma.projectRepository.delete({
    where: {
      projectId: projectId,
      url: repositoryUrl,
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([repoDelete, projectUpdate])
}

export async function updateProjectRepository({
  projectId,
  url,
  updates,
}: {
  projectId: string
  url: string
  updates: Prisma.ProjectRepositoryUpdateInput
}) {
  const repoUpdate = prisma.projectRepository.update({
    where: {
      projectId,
      url,
    },
    data: updates,
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([repoUpdate, projectUpdate])
}

export async function updateProjectRepositories({
  projectId,
  type,
  repositories,
}: {
  projectId: string
  type: string
  repositories: Prisma.ProjectRepositoryCreateManyInput[]
}) {
  // Delete the existing repositories and replace it
  const remove = prisma.projectRepository.deleteMany({
    where: {
      projectId,
      type,
    },
  })

  const create = prisma.projectRepository.createMany({
    data: repositories.map((r) => ({
      ...r,
      projectId,
    })),
  })

  const update = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([remove, create, update])
}

export async function updateProjectLinks({
  projectId,
  links,
}: {
  projectId: string
  links: Prisma.ProjectLinksCreateManyInput[]
}) {
  // Delete the existing links and replace it
  const remove = prisma.projectLinks.deleteMany({
    where: {
      projectId,
    },
  })

  const create = prisma.projectLinks.createMany({
    data: links.map((l) => ({
      ...l,
      projectId,
    })),
  })

  const update = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return await prisma.$transaction([remove, create, update])
}

export async function updateProjectFunding({
  projectId,
  funding,
}: {
  projectId: string
  funding: Prisma.ProjectFundingCreateManyInput[]
}) {
  // Delete the existing funding and replace it
  const remove = prisma.projectFunding.deleteMany({
    where: {
      projectId,
    },
  })

  const create = prisma.projectFunding.createMany({
    data: funding.map((f) => ({
      ...f,
      projectId,
    })),
  })

  // Mark that the project was funded
  const update = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      addedFunding: true,
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([remove, create, update])
}

export async function addProjectSnapshot({
  projectId,
  ipfsHash,
  attestationId,
}: {
  projectId: string
  ipfsHash: string
  attestationId: string
}) {
  return prisma.projectSnapshot.create({
    data: {
      ipfsHash,
      attestationId,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })
}

export async function createApplication({
  round,
  projectId,
  attestationId,
  categoryId,
  impactStatement,
  projectDescriptionOptions,
}: {
  round: number
  projectId: string
  attestationId: string
  categoryId: string
  projectDescriptionOptions: string[]
  impactStatement: Record<string, string>
}) {
  return prisma.application.create({
    data: {
      attestationId,
      projectDescriptionOptions,
      project: {
        connect: {
          id: projectId,
        },
      },
      round: {
        connect: {
          id: round.toString(),
        },
      },
      category: {
        connect: {
          id: categoryId,
        },
      },
      impactStatementAnswer: {
        createMany: {
          data: Object.entries(impactStatement).map(
            ([impactStatementId, answer]) => ({
              impactStatementId,
              answer,
            }),
          ),
        },
      },
    },
  })
}

async function getUserApplicationsFn({
  userId,
  roundId,
}: {
  userId: string
  roundId?: string
}): Promise<ApplicationWithDetails[]> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      projects: {
        where: {
          project: {
            deletedAt: null,
          },
        },
        include: {
          project: {
            include: {
              applications: {
                include: {
                  impactStatementAnswer: {
                    include: {
                      impactStatement: true,
                    },
                  },
                  project: true,
                  round: true,
                },
                where: {
                  roundId,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      },
      organizations: {
        where: {
          organization: {
            deletedAt: null,
          },
        },
        include: {
          organization: {
            include: {
              projects: {
                where: {
                  project: {
                    deletedAt: null,
                  },
                },
                include: {
                  project: {
                    include: {
                      applications: {
                        include: {
                          impactStatementAnswer: true,
                          project: true,
                          round: true,
                        },
                        where: {
                          roundId,
                        },
                        orderBy: {
                          createdAt: "desc",
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

  // merge organization applications with user applications
  if (!user) return []

  const applications = [
    ...user.projects.flatMap((p) => p.project.applications),
    ...user.organizations.flatMap((o) =>
      o.organization.projects.flatMap((p) => p.project.applications),
    ),
  ]

  return applications
}

export const getUserApplications = cache(getUserApplicationsFn)

export async function updateAllForProject(
  project: ProjectMetadata,
  projectId: string,
) {
  // Update project
  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: project.name,
      description: project.description,
      category: project.category,
      thumbnailUrl: project.projectAvatarUrl,
      bannerUrl: project.projectCoverImageUrl,
      website: project.socialLinks.website,
      twitter: project.socialLinks.twitter,
      mirror: project.socialLinks.mirror,
      farcaster: project.socialLinks.farcaster,
      openSourceObserverSlug: project.osoSlug,
      lastMetadataUpdate: new Date(),
    },
  })

  const cleanupContracts = prisma.projectContract.deleteMany({
    where: {
      projectId,
    },
  })

  const contractsCreate = prisma.projectContract.createMany({
    data: project.contracts.map((contract) => ({
      contractAddress: contract.address,
      deploymentHash: contract.deploymentTxHash,
      deployerAddress: contract.deployerAddress,
      verificationProof: contract.verificationProof ?? "",
      chainId: contract.chainId,
      projectId,
    })),
  })

  const cleanupRepositories = prisma.projectRepository.deleteMany({
    where: {
      projectId,
    },
  })

  const createRepositories = prisma.projectRepository.createMany({
    data: [
      ...project.github.map((repo) => ({
        url: repo.url,
        type: "github",
        projectId,
      })),
      ...project.packages.map((repo) => ({
        url: repo.url,
        type: "package",
        projectId,
      })),
    ],
  })

  const cleanupFunding = prisma.projectFunding.deleteMany({
    where: {
      projectId,
    },
  })

  const createFunding = prisma.projectFunding.createMany({
    data: [
      ...project.grantsAndFunding.ventureFunding.map((funding) => ({
        amount: funding.amount,
        receivedAt: funding.year,
        details: funding.details,
        type: "venture",
        projectId,
      })),
      ...project.grantsAndFunding.revenue.map((funding) => ({
        amount: funding.amount,
        receivedAt: "",
        details: funding.details,
        type: "revenue",
        projectId,
      })),
      ...project.grantsAndFunding.grants.map((funding) => ({
        amount: funding.amount,
        receivedAt: funding.date,
        details: funding.details,
        type: "grant",
        projectId,
      })),
    ],
  })

  return prisma.$transaction([
    projectUpdate,
    cleanupContracts,
    contractsCreate,
    cleanupRepositories,
    createRepositories,
    cleanupFunding,
    createFunding,
  ])
}
