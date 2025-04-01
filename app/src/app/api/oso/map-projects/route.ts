import { NextResponse } from "next/server"

import { prisma } from "@/db/client"

import { fetchOSOProjects } from "../common"

export async function GET(req: Request) {
  try {
    let projectAtlasIds: string[] = []

    await prisma.$transaction(async (tx) => {
      const existingOSO = await tx.projectOSO.findMany({
        select: { projectId: true },
      })

      const existingIds = existingOSO.map((r) => r.projectId)

      const projects = await tx.project.findMany({
        select: { id: true },
        where: { id: { notIn: existingIds } },
      })

      projectAtlasIds = projects.map(({ id }) => id)
    })

    const { processed } = await fetchOSOProjects(projectAtlasIds)

    return NextResponse.json({
      status: 200,
      body: { message: "Success", count: processed },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 500, body: { message: "Error" } })
  }
}
