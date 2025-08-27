import { NextRequest, NextResponse } from "next/server"

import { getProposals } from "@/lib/proposals"

export const dynamic = "force-dynamic"

export const GET = async (req: NextRequest) => {
  try {
    const data = await getProposals()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 },
    )
  }
}
