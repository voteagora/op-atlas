import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { createEndorsement, getEndorsementCounts } from "@/db/endorsements"
import { isTop100Delegate } from "@/lib/services/top100"

const payloadSchema = z.object({
  context: z.string().min(1),
  nomineeApplicationId: z.number().int().positive(),
})

function isFeatureEnabled() {
  return process.env.NEXT_PUBLIC_FEATURE_SC_ENDORSEMENTS === "true"
}

export async function POST(req: NextRequest) {
  if (!isFeatureEnabled()) return new Response("Disabled", { status: 404 })
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = payloadSchema.safeParse(json)
  if (!parsed.success)
    return new Response("Bad Request", { status: 400 })

  const { context, nomineeApplicationId } = parsed.data

  const application = await prisma.roleApplication.findUnique({
    where: { id: nomineeApplicationId },
    include: { role: true },
  })
  if (!application?.role) return new Response("Not Found", { status: 404 })
  // Optional: gate endorsements by role nomination window (between start and end)
  const now = new Date()
  if (
    (application.role.startAt && now < new Date(application.role.startAt)) ||
    (application.role.voteStartAt && now > new Date(application.role.voteStartAt))
  ) {
    return new Response("Window closed", { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true },
  })
  const addresses = user?.addresses?.map((a) => a.address) || []
  const allowed = await isTop100Delegate(addresses)
  if (!allowed) return new Response("Forbidden", { status: 403 })

  const primary =
    user?.addresses?.find((a) => a.primary)?.address || addresses[0]
  if (!primary) return new Response("No address", { status: 400 })

  const endorsement = await createEndorsement({
    context,
    nomineeApplicationId,
    endorserAddress: primary,
    endorserUserId: session.user.id,
  })
  return NextResponse.json({ id: endorsement.id })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const context = searchParams.get("context")
  const nomineeIds = searchParams
    .getAll("nomineeId")
    .map((x) => Number(x))
  if (!context || nomineeIds.length === 0)
    return new Response("Bad Request", { status: 400 })

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
