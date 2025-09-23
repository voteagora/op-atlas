import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import {
  getEndorsedNomineeIdsForAddressesByRole,
  hasEndorsed,
} from "@/db/endorsements"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })
  const { searchParams } = new URL(req.url)
  const context = searchParams.get("context")
  const nomineeId = Number(searchParams.get("nomineeId"))
  const roleId = Number(searchParams.get("roleId"))
  if (!context) return new Response("Bad Request", { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
        await hasEndorsed({
          context,
          nomineeApplicationId: nomineeId,
          endorserAddress: addr,
        })
      ) {
        endorsed = true
        break
      }
    }
    return NextResponse.json({ endorsed })
  }

  // If roleId is provided, return all nominee ids endorsed by this user for the role
  if (Number.isFinite(roleId) && roleId > 0) {
    const endorsedIds = await getEndorsedNomineeIdsForAddressesByRole({
      context,
      roleId,
      addresses,
    })
    return NextResponse.json({ endorsedIds })
  }

  return new Response("Bad Request", { status: 400 })
}
