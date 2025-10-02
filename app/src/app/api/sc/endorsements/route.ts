import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import {
  createEndorsement,
  deleteEndorsementsForAddresses,
  getEndorsementCounts,
  getEndorsementCountsByRole,
} from "@/db/endorsements"
import { isTop100Delegate } from "@/lib/services/top100"

const payloadSchema = z.object({
  context: z.string().min(1),
  nomineeApplicationId: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = payloadSchema.safeParse(json)
  if (!parsed.success) return new Response("Bad Request", { status: 400 })

  const { context, nomineeApplicationId } = parsed.data

  let start: Date | null = null
  let end: Date | null = null
  const appRole = await prisma.roleApplication.findUnique({
    where: { id: nomineeApplicationId },
    select: { roleId: true },
  })
  if (!appRole?.roleId) return new Response("Not Found", { status: 404 })
  const roleWindow = await prisma.role.findUnique({
    where: { id: appRole.roleId },
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
    return new Response("Window closed", { status: 403 })
  }

  const now = new Date()
  if ((start && now < start) || (end && now > end)) {
    return new Response("Window closed", { status: 403 })
  }

  const [userWallets, safeWallets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { addresses: true },
    }),
    prisma.userSafeAddress.findMany({
      where: { userId: session.user.id },
    }),
  ])

  const walletAddresses = userWallets?.addresses?.map((a) => a.address) || []
  const safeAddresses = safeWallets?.map((a) => a.safeAddress) || []
  const addresses = [...walletAddresses, ...safeAddresses]
  const allowed = await isTop100Delegate(addresses)
  if (!allowed) return new Response("Forbidden", { status: 403 })

  const endorserAddress =
    userWallets?.addresses?.find((a) => a.primary)?.address || addresses[0]
  if (!endorserAddress) return new Response("No address", { status: 400 })

  const endorsement = await createEndorsement({
    context,
    nomineeApplicationId,
    endorserAddress,
    endorserUserId: session.user.id,
  })
  return NextResponse.json({ id: endorsement.id })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const context = searchParams.get("context")
  const roleId = Number(searchParams.get("roleId"))
  const nomineeIds = searchParams.getAll("nomineeId").map((x) => Number(x))

  if (!context) return new Response("Bad Request", { status: 400 })

  if (Number.isFinite(roleId) && roleId > 0) {
    const map = await getEndorsementCountsByRole({ context, roleId })
    return NextResponse.json(
      Array.from(map.entries()).map(([id, count]) => ({
        nomineeApplicationId: id,
        count,
      })),
    )
  }

  if (nomineeIds.length > 0) {
    const map = await getEndorsementCounts({
      context,
      nomineeApplicationIds: nomineeIds,
    })
    return NextResponse.json(
      nomineeIds.map((id) => ({
        nomineeApplicationId: id,
        count: map.get(id) || 0,
      })),
    )
  }

  return new Response("Bad Request", { status: 400 })
}

export async function DELETE(req: NextRequest) {
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
  const addresses = (user?.addresses || []).map((a) => a.address)

  const removed = await deleteEndorsementsForAddresses({
    context,
    nomineeApplicationId: nomineeId,
    addresses,
  })
  return NextResponse.json({ removed })
}
