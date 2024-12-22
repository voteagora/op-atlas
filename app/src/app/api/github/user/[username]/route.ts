import { NextResponse } from "next/server"
import { githubClient } from "@/app/api/github/common"

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const { username } = params

  const user = await githubClient(`/users/${username}`)

  return NextResponse.json(user)
}
