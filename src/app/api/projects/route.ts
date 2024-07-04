import { NextRequest, NextResponse } from "next/server"

import { upsertUser } from "@/db/users"
import { createNewProjectOnBehalf } from "@/lib/actions/projects"

export const POST = async (req: NextRequest) => {
  const { name, farcasterId, issuer } = await req.json()

  const { id } = await upsertUser({ farcasterId })
  const project = await createNewProjectOnBehalf(
    { name },
    id,
    farcasterId,
    issuer,
  )

  return NextResponse.json(project)
}
