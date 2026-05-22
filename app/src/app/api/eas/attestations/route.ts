import { NextRequest, NextResponse } from "next/server"

import { getAttestationsForAddresses } from "@/lib/eas/repository"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!Array.isArray(body?.addresses)) {
    return NextResponse.json(
      { error: "addresses must be an array" },
      { status: 400 },
    )
  }

  const attestations = await getAttestationsForAddresses(body.addresses)

  return NextResponse.json(attestations)
}
