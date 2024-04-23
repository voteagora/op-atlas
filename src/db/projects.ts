"use server"

import { Project } from "@prisma/client"
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
          owner: true,
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
