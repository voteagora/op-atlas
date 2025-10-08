import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

import { getUserByAddress } from "@/db/users"

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } },
) {
  const { address } = params
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    return new Response("Bad Request", { status: 400 })
  }

  const user = await getUserByAddress(address)
  if (user?.username) {
    redirect(`/${user.username}`)
  }

  return new Response("Not Found", { status: 404 })
}
