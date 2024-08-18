"use server"

import { Prisma, Project } from "@prisma/client"

import { TeamRole } from "@/lib/types"
import { ProjectMetadata } from "@/lib/utils/metadata"

import { prisma } from "./client"

export async function getUserProjects({
  farcasterId,
}: {
  farcasterId: string
}) {
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

export async function getUserAdminProjectsWithDetail({
  userId,
}: {
  userId: string
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
                where: { deletedAt: null },
                include: { organization: true },
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

export const getRandomProjects = () => {
  return prisma.project.findMany({
    where: {
      deletedAt: null,
    },
    take: 5,
  })
}

export async function getUserProjectsWithDetails({
  userId,
}: {
  userId: string
}) {
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
                include: { organization: true },
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
                      role: "contributor",

                      user: {
                        connect: {
                          id: member.userId,
                        },
                      },
                      isOrganizationMember: true, // Mark members as joined through organization
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
  organizationId,
}: {
  id: string
  project: UpdateProjectParams
  organizationId?: string
}) {
  return prisma.$transaction(async (prisma) => {
    // Update the project with only necessary fields and update timestamp
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...project,
        lastMetadataUpdate: new Date(),
      },
    })

    // Fetch the current organization ID linked to the project (if any)
    const currentOrganizationId = await prisma.projectOrganization
      .findUnique({
        where: { projectId: id },
        select: { organizationId: true },
      })
      .then((org) => org?.organizationId)

    if (organizationId !== currentOrganizationId) {
      // If the organization is changing or being removed, handle the user project updates
      if (currentOrganizationId) {
        await prisma.userProjects.deleteMany({
          where: {
            projectId: id,
            isOrganizationMember: true, // Only remove members who joined through the previous organization
          },
        })
      }

      if (organizationId) {
        // Upsert the organization association (delete old one if it exists, and insert a new one)
        await prisma.projectOrganization.upsert({
          where: { projectId: id },
          update: { organizationId },
          create: { projectId: id, organizationId },
        })

        // Fetch new organization members and batch insert them
        const newOrganizationMembers = await prisma.userOrganization.findMany({
          where: { organizationId, deletedAt: null },
          select: { userId: true },
        })

        if (newOrganizationMembers.length > 0) {
          await prisma.userProjects.createMany({
            data: newOrganizationMembers.map((member) => ({
              projectId: id,
              userId: member.userId,
              role: "contributor",
              isOrganizationMember: true, // Mark members as joined through the organization
            })),
            skipDuplicates: true, // Avoid inserting duplicates
          })
        }
      } else {
        // Remove the organization association if `organizationId` is now undefined
        await prisma.projectOrganization.deleteMany({
          where: { projectId: id },
        })
      }
    }

    return updatedProject
  })
}

export async function deleteProject({ id }: { id: string }) {
  return prisma.$transaction([
    prisma.project.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    }),
    prisma.projectOrganization.updateMany({
      where: {
        projectId: id,
        deletedAt: null, // Ensures only non-deleted records are updated
      },
      data: {
        deletedAt: new Date(),
      },
    }),
  ])
}

export async function getProject({ id }: { id: string }) {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
      repos: true,
      contracts: true,
      links: true,
      funding: true,
      snapshots: {
        orderBy: {
          createdAt: "asc",
        },
      },
      applications: true,
      organization: {
        where: { deletedAt: null },
        include: { organization: true },
      },
      rewards: { include: { claim: true } },
    },
  })
}

export async function getProjectTeam({ id }: { id: string }) {
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

export async function getProjectContracts({
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

export async function addProjectRepository({
  projectId,
  repo,
}: {
  projectId: string
  repo: Omit<Prisma.ProjectRepositoryCreateInput, "project">
}) {
  const repoCreate = prisma.projectRepository.create({
    data: {
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
  projects,
}: {
  round: number
  projects: {
    projectId: string
    attestationId: string
    categoryId: string
    impactStatement: Record<string, string>
    projectDescriptionOption: string
  }[]
}) {
  return prisma.$transaction(async (prisma) => {
    // Create the application
    const application = await prisma.application.create({
      data: {
        round: {
          connect: {
            id: round.toString(),
          },
        },
      },
    })

    // Prepare ProjectApplications and ImpactStatements data
    const projectApplicationsData = projects.map((project) => ({
      applicationId: application.id,
      projectId: project.projectId,
      categoryId: project.categoryId,
      attestationId: project.attestationId,
      projectDescriptionOption: project.projectDescriptionOption,
    }))

    await prisma.applicationProject.createMany({
      data: projectApplicationsData,
    })

    const applicationProjects = await prisma.applicationProject.findMany({
      where: {
        applicationId: application.id,
      },
    })

    // Collect ImpactStatementAnswers data
    const impactStatementAnswersData = projects.flatMap((project, index) =>
      Object.entries(project.impactStatement).map(
        ([impactStatementId, answer]) => ({
          applicationProjectId: applicationProjects[index].id,
          impactStatementId,
          answer,
        }),
      ),
    )

    // Batch create ImpactStatementAnswers
    await prisma.impactStatementAnswer.createMany({
      data: impactStatementAnswersData,
    })

    return { ...application, projects: applicationProjects }
  })
}

export async function updateApplication({
  applicationId,
  projects,
}: {
  applicationId: string
  projects: {
    projectId: string
    attestationId: string
    categoryId: string
    impactStatement: Record<string, string>
    projectDescriptionOption: string
  }[]
}) {
  return prisma.$transaction(async (prisma) => {
    // Update the existing application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {},
    })

    // Prepare updated ProjectApplications data
    const projectApplicationsData = projects.map((project) => ({
      applicationId: updatedApplication.id,
      projectId: project.projectId,
      categoryId: project.categoryId,
      attestationId: project.attestationId,
      projectDescriptionOption: project.projectDescriptionOption,
    }))

    // Update or create ProjectApplications
    for (const projectData of projectApplicationsData) {
      await prisma.applicationProject.upsert({
        where: {
          applicationId_projectId: {
            applicationId: projectData.applicationId,
            projectId: projectData.projectId,
          },
        },
        update: projectData,
        create: projectData,
      })
    }

    const applicationProjects = await prisma.applicationProject.findMany({
      where: {
        applicationId: updatedApplication.id,
      },
    })

    // Collect updated ImpactStatementAnswers data
    for (const project of projects) {
      const applicationProject = applicationProjects.find(
        (ap) => ap.projectId === project.projectId,
      )

      if (applicationProject) {
        for (const [impactStatementId, answer] of Object.entries(
          project.impactStatement,
        )) {
          const existingAnswer = await prisma.impactStatementAnswer.findFirst({
            where: {
              applicationProjectId: applicationProject.id,
              impactStatementId,
            },
          })

          if (existingAnswer) {
            await prisma.impactStatementAnswer.update({
              where: { id: existingAnswer.id },
              data: { answer },
            })
          } else {
            await prisma.impactStatementAnswer.create({
              data: {
                applicationProjectId: applicationProject.id,
                impactStatementId,
                answer,
              },
            })
          }
        }
      }
    }

    return { ...updatedApplication, projects: applicationProjects }
  })
}

export async function getUserApplications({
  userId,
  roundId,
}: {
  userId: string
  roundId?: string
}) {
  const applications = await prisma.application.findMany({
    where: {
      roundId: roundId ?? undefined,
      projects: {
        some: {
          project: {
            team: {
              some: {
                userId: userId,
                deletedAt: null,
              },
            },
          },
        },
      },
    },
    include: {
      projects: {
        include: {
          impactStatementAnswers: true,
        },
      },
    },
  })

  return applications
}

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
        url: repo,
        type: "github",
        projectId,
      })),
      ...project.packages.map((repo) => ({
        url: repo,
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
