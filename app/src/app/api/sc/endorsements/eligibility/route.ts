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
      voteStartAt: true,
      voteEndAt: true,
    },
  })
  if (!roleWindow) return new Response("Not Found", { status: 404 })

  // Read role window with safe fallback for pre-migration DBs (no endorsement* columns)
  const start = roleWindow.endorsementStartAt ?? roleWindow.voteStartAt ?? null
  const end = roleWindow.endorsementEndAt ?? roleWindow.voteEndAt ?? null

  const now = new Date()
  if ((start && now < start) || (end && now > end)) {
    return NextResponse.json({ eligible: false, reason: "window_closed" })
  }
  return NextResponse.json({ eligible: true })
}

