"use server"

import { Prisma, Project } from "@prisma/client"

import { TeamRole } from "@/lib/types"

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

export async function getUserProjectsWithDetails({
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
          project: {
            deletedAt: null,
          },
        },
        include: {
          project: {
            include: {
              team: true,
              repos: true,
              contracts: true,
              funding: true,
              applications: true,
            },
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
  description: string
}

export async function createProject({
  farcasterId,
  project,
}: {
  farcasterId: string
  project: CreateProjectParams
}) {
  return prisma.project.create({
    data: {
      ...project,
      team: {
        create: {
          role: "owner" satisfies TeamRole,
          user: {
            connect: {
              farcasterId,
            },
          },
        },
      },
    },
  })
}

export async function updateProject({
  id,
  project,
}: {
  id: string
  project: CreateProjectParams
}) {
  return prisma.project.update({
    where: {
      id,
    },
    data: project,
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

export async function getProject({ id }: { id: string }) {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      team: true,
      repos: true,
      contracts: true,
      funding: true,
      applications: true,
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
        include: {
          user: true,
        },
      },
    },
  })
}

export async function addTeamMember({
  projectId,
  userId,
  role = "member",
}: {
  projectId: string
  userId: string
  role?: TeamRole
}) {
  return prisma.userProjects.create({
    data: {
      role,
      user: {
        connect: {
          id: userId,
        },
      },
      project: {
        connect: {
          id: projectId,
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
  return prisma.userProjects.createMany({
    data: userIds.map((userId) => ({
      role,
      userId,
      projectId,
    })),
  })
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
  return prisma.userProjects.update({
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
}

export async function removeTeamMember({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) {
  return prisma.userProjects.delete({
    where: {
      userId_projectId: {
        projectId,
        userId,
      },
    },
  })
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

  return prisma.$transaction([remove, create])
}
