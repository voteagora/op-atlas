import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"

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
  const addresses = new Set(
    (user?.addresses || []).map((a) => a.address.toLowerCase()),
  )

  const existing = await prisma.endorsement.findFirst({
    where: {
      context,
      nomineeApplicationId: nomineeId,
      endorserAddress: { in: Array.from(addresses) },
    },
    select: { id: true },
  })

  return NextResponse.json({ endorsed: !!existing })
}
