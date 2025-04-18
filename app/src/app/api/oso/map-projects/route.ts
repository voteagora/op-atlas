import { NextResponse } from "next/server"

import { getOSOMappedProjectIds } from "@/db/projects"

import { mapOSOProjects } from "@/lib/oso"

export async function GET(req: Request) {
  try {
    const projectAtlasIds = await getOSOMappedProjectIds()

    const { mapped } = await mapOSOProjects(projectAtlasIds)

    return NextResponse.json({
      status: 200,
      body: { message: "Success", count: mapped },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 500, body: { message: "Error" } })
  }
}
