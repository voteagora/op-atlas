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

  const [userWallets, safeWallets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    }),
    prisma.userSafeAddress.findMany({
      where: { userId },
    }),
  ])

  const walletAddresses = userWallets?.addresses?.map((a) => a.address) || []
  const safeAddresses = safeWallets?.map((a) => a.safeAddress) || []
  const addresses = [...walletAddresses, ...safeAddresses]
  
  const top100 = await isTop100Delegate(addresses)
  return NextResponse.json({ top100 })
}