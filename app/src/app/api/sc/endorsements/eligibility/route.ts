import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/db/client"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roleId = Number(searchParams.get("roleId"))
  if (!roleId) return new Response("Bad Request", { status: 400 })

  const roleWindow = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      endorsementStartAt: true,
      endorsementEndAt: true,
    },
  })
  if (!roleWindow) return new Response("Not Found", { status: 404 })

  // Enforce explicit endorsement window only
  const start = roleWindow.endorsementStartAt ?? null
  const end = roleWindow.endorsementEndAt ?? null
  if (!start || !end) {
    return NextResponse.json({ eligible: false, reason: "window_closed" })
  }

  const now = new Date()
  if ((start && now < start) || (end && now > end)) {
    return NextResponse.json({ eligible: false, reason: "window_closed" })
  }
  return NextResponse.json({ eligible: true })
}
