import { NextResponse } from "next/server"
import { getAddress } from "viem"

import { prisma } from "@/db/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const { searchParams } = new URL(request.url)
  const deployer = searchParams.get("deployer")

  try {
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

    const count = await prisma.projectContract.count({ where })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Failed to fetch contract count", error)
    return NextResponse.json(
      { error: "Failed to fetch contract count" },
      { status: 500 },
    )
  }
}
