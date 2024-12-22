import { NextResponse } from "next/server"
import { neynarClient } from "../../common"

export async function GET(
  request: Request,
  { params }: { params: { fid: string } },
) {
  const { fid } = params

  const farcasterUser = await neynarClient(`/user/bulk?fids=${fid}`)

  return NextResponse.json(farcasterUser)
}
