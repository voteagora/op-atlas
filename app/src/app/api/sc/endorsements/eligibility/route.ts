import { NextRequest, NextResponse } from "next/server"

import { withImpersonation } from "@/lib/db/sessionContext"
import { isTop100Delegate } from "@/lib/services/top100"

export async function GET(req: NextRequest) {
  const { db, userId } = await withImpersonation()
  const { searchParams } = new URL(req.url)
  const roleId = Number(searchParams.get("roleId"))

  if (!roleId || !Number.isFinite(roleId)) {
    return new Response("Bad Request", { status: 400 })
  }

  let start: Date | null = null
  let end: Date | null = null
  const roleWindow = await db.role.findUnique({
    where: { id: roleId },
    select: {
      endorsementStartAt: true,
      endorsementEndAt: true,
    },
  })
  if (!roleWindow) return new Response("Not Found", { status: 404 })
  start = roleWindow.endorsementStartAt ?? null
  end = roleWindow.endorsementEndAt ?? null

  // Require explicit endorsement window; if missing, treat as closed
  if (!start || !end) {
    return NextResponse.json({ eligible: false, reason: "window_closed" })
  }

  const now = new Date()
  if ((start && now < start) || (end && now > end)) {
    return NextResponse.json({ eligible: false, reason: "window_closed" })
  }

  if (!userId)
    return NextResponse.json({ eligible: false, reason: "unauthenticated" })

  const [userWallets, safeWallets] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    }),
    db.userSafeAddress.findMany({
      where: { userId },
    }),
  ])
  const walletAddresses = userWallets?.addresses?.map((a) => a.address) || []
  const safeAddresses = safeWallets?.map((a) => a.safeAddress) || []
  const addresses = [...walletAddresses, ...safeAddresses]
  const top100 = await isTop100Delegate(addresses, db)
  return NextResponse.json({
    eligible: top100,
    reason: top100 ? undefined : "not_top100",
  })
}
