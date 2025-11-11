import { NextResponse } from "next/server"

import { withImpersonation } from "@/lib/db/sessionContext"
import { isTop100Delegate } from "@/lib/services/top100"

export async function GET() {
  const { db, userId } = await withImpersonation()
  
  if (!userId) {
    return NextResponse.json({ top100: false })
  }

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
  return NextResponse.json({ top100 })
}
