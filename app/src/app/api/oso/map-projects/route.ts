import { NextResponse } from "next/server"

import { getOSOMappedProjectIds } from "@/db/projects"

import { fetchOSOProjects } from "../common"

export async function GET(req: Request) {
  try {
    const projectAtlasIds = await getOSOMappedProjectIds()

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
