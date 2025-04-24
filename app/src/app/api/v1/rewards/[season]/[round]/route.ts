import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getRewardStreamsForRound } from "@/lib/actions/rewards"
import { authenticateApiUser } from "@/serverAuth"

const ROUNDS = {
  "onchain-builders": 8,
  "dev-tooling": 7,
} as const

const roundSchema = z.enum(Object.keys(ROUNDS) as [string, ...string[]])

export const GET = async (
  req: NextRequest,
  { params }: { params: { season: string; round: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  const validatedRound = roundSchema.parse(params.round)
  const rewards = await getRewardStreamsForRound(
    ROUNDS[validatedRound as keyof typeof ROUNDS].toString(),
  )
  return NextResponse.json(rewards)
}
