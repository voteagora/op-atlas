import { NextResponse } from "next/server"

import { isBadgeholderAddress } from "@/lib/eas/repository"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  _request: Request,
  { params }: { params: { address: string } },
) {
  const isBadgeholder = await isBadgeholderAddress(params.address)

  return NextResponse.json({ isBadgeholder })
}
