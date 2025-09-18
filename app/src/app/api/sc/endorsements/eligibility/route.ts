import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { isTop100Delegate } from "@/lib/services/top100"

export async function GET(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const { searchParams } = new URL(req.url)
  const roleId = Number(searchParams.get("roleId"))

  if (!roleId || !Number.isFinite(roleId)) {
    return new Response("Bad Request", { status: 400 })
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) return new Response("Not Found", { status: 404 })

  const now = new Date()
  if ((role.voteStartAt && now < role.voteStartAt) || (role.voteEndAt && now > role.voteEndAt)) {
    return NextResponse.json({ eligible: false, reason: "window_closed" })
  }

  if (!userId) return NextResponse.json({ eligible: false, reason: "unauthenticated" })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  })
  const addresses = user?.addresses?.map((a) => a.address) || []
  const top100 = await isTop100Delegate(addresses)

  return NextResponse.json({ eligible: top100, reason: top100 ? undefined : "not_top100" })
}


