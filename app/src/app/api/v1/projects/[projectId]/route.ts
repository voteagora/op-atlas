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
    const res = await deleteProject({ id: route.params.projectId })

    return NextResponse.json({ deleted: !!res, id: res.id })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify(e), { status: 500 })
  }
}
