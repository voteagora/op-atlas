import { NextResponse } from "next/server"
import { getAddress } from "viem"

import { verifyMembership } from "@/lib/actions/utils"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const { db, userId } = await getImpersonationContext()
  const { searchParams } = new URL(request.url)
  const deployer = searchParams.get("deployer")

  try {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await verifyMembership(params.projectId, userId, db)
    if (membership?.error) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const where: { projectId: string; deployerAddress?: string } = {
      projectId: params.projectId,
    }

    if (deployer) {
      try {
        where.deployerAddress = getAddress(deployer)
      } catch {
        return NextResponse.json(
          { error: "Invalid deployer address" },
          { status: 400 },
        )
      }
    }

    const count = await db.projectContract.count({ where })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Failed to fetch contract count", error)
    return NextResponse.json(
      { error: "Failed to fetch contract count" },
      { status: 500 },
    )
  }
}
