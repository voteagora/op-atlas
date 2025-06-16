"use server"

import { Role } from "@prisma/client"

import { prisma } from "./client"

export async function getAllRoles(): Promise<Role[]> {
  return prisma.role.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })
}
