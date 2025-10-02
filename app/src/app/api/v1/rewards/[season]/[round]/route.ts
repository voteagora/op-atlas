import { NextRequest, NextResponse } from "next/server"

import { getRewardStreamsForRound } from "@/lib/actions/rewards"
import { ROUND_IDS, VALID_SEASONS, SEASON_TRANCHES } from "@/lib/constants/rewards"
import { authenticateApiUser } from "@/serverAuth"

export const GET = async (
  req: NextRequest,
  { params }: { params: { season: string; round: string } },
) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  // Validate season
  const season = parseInt(params.season)
  if (!VALID_SEASONS.includes(season as any)) {
    return new Response(`Invalid season: ${params.season}`, { status: 400 })
  }

  // Validate round name
  const roundId = ROUND_IDS[params.round as keyof typeof ROUND_IDS]
  if (!roundId) {
    return new Response(`Invalid round: ${params.round}`, { status: 400 })
  }

  // Check if this season/round combination is configured
  const seasonKey = `${season}-${roundId}`
  if (!(seasonKey in SEASON_TRANCHES)) {
    return new Response(
      `Round ${params.round} not available for season ${season}`, 
      { status: 400 }
    )
  }

  // Pass both roundId and season to get correct tranches
  const rewards = await getRewardStreamsForRound(roundId, season)
  return NextResponse.json(rewards)
}
