import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { isTop100Delegate } from "@/lib/services/top100"

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ top100: false })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  })

  const addresses = user?.addresses?.map((a) => a.address) || []
  const top100 = await isTop100Delegate(addresses)
  return NextResponse.json({ top100 })
}


