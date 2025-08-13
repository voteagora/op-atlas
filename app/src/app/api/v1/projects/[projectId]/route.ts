import { NextRequest, NextResponse } from "next/server"

import { deleteProject } from "@/db/projects"
import { authenticateApiUser } from "@/serverAuth"

export const DELETE = async (
  req: NextRequest,
  route: { params: { projectId: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  try {
    const res = await deleteProject({
      id: route.params.projectId,
    })
    const updatedProject = res.updatedProject
    const deletedRepositories = res.deletedRepositories

    return NextResponse.json({
      deleted:
        updatedProject.id === route.params.projectId &&
        deletedRepositories.count > 0,
      id: updatedProject.id,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify(e), { status: 500 })
  }
}
