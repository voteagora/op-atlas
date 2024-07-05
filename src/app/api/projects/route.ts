import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { upsertUser } from "@/db/users"
import { createNewProjectOnBehalf } from "@/lib/actions/projects"

const payloadValidator = z.object({
  name: z.string(),
  farcasterId: z.string(),
  issuer: z.string(),
})

export const POST = async (req: NextRequest) => {
  // TODO: get issuer from API key

  const { name, farcasterId, issuer } = payloadValidator.parse(await req.json())

  const { id } = await upsertUser({ farcasterId })
  const project = await createNewProjectOnBehalf(
    { name },
    id,
    farcasterId,
    issuer,
  )

  return NextResponse.json(project)
}
