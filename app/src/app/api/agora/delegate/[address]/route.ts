import { NextResponse } from "next/server"

import { agoraClient } from "@/app/api/agora/common"

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const { address } = params

  const delegate = await agoraClient(`/delegates/${address}`)

  return NextResponse.json(delegate)
}
