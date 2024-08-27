import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { upsertUser } from "@/db/users"
import { createNewProjectOnBehalf } from "@/lib/actions/projects"
import { authenticateApiUser } from "@/serverAuth"

const payloadValidator = z.object({
  name: z.string(),
  farcasterId: z.string(),
})

export const POST = async (req: NextRequest) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  try {
    const { name, farcasterId } = payloadValidator.parse(await req.json())

    const { id } = await upsertUser({ farcasterId })
    const project = await createNewProjectOnBehalf({ name }, id, farcasterId)

    return NextResponse.json({ attestationId: project.id })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify(e), { status: 500 })
  }
}
