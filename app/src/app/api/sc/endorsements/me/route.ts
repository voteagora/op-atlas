import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { hasEndorsed } from "@/db/endorsements"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })
  const { searchParams } = new URL(req.url)
  const context = searchParams.get("context")
  const nomineeId = Number(searchParams.get("nomineeId"))
  if (!context || !nomineeId)
    return new Response("Bad Request", { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true },
  })
  const addresses = Array.from(
    new Set((user?.addresses || []).map((a) => a.address.toLowerCase())),
  )

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
