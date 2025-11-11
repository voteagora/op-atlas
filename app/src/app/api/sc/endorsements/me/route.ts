import { NextRequest, NextResponse } from "next/server"

import { withImpersonation } from "@/lib/db/sessionContext"
import {
  getEndorsedNomineeIdsForAddressesByRole,
  hasEndorsed,
} from "@/db/endorsements"

export async function GET(req: NextRequest) {
  const { db, userId } = await withImpersonation()
  if (!userId) return new Response("Unauthorized", { status: 401 })
  const { searchParams } = new URL(req.url)
  const context = searchParams.get("context")
  const nomineeId = Number(searchParams.get("nomineeId"))
  const roleId = Number(searchParams.get("roleId"))
  if (!context) return new Response("Bad Request", { status: 400 })

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  })
  const addresses = Array.from(
    new Set((user?.addresses || []).map((a) => a.address.toLowerCase())),
  )

  // If nomineeId is provided, return boolean endorsed for that nominee
  if (Number.isFinite(nomineeId) && nomineeId > 0) {
    let endorsed = false
    for (const addr of addresses) {
      if (
        await hasEndorsed(
          {
            context,
            nomineeApplicationId: nomineeId,
            endorserAddress: addr,
          },
          db,
        )
      ) {
        endorsed = true
        break
      }
    }
    return NextResponse.json({ endorsed })
  }

  // If roleId is provided, return all nominee ids endorsed by this user for the role
  if (Number.isFinite(roleId) && roleId > 0) {
    const endorsedIds = await getEndorsedNomineeIdsForAddressesByRole(
      {
        context,
        roleId,
        addresses,
      },
      db,
    )
    return NextResponse.json({ endorsedIds })
  }

  return new Response("Bad Request", { status: 400 })
}
