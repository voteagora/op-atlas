import { Prisma } from "@prisma/client"

export type TeamRole = "member" | "admin" | "owner"

export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: {
    team: { include: { user: true } }
    repos: true
    contracts: true
    snapshots: true
    funding: true
  }
}>
