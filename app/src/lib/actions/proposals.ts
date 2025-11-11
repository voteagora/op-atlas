"use server"

import { getEnrichedProposalData } from "@/lib/proposals"
import { withSessionDb } from "@/lib/db/sessionContext"

// Server action to fetch more proposals
export async function fetchMoreProposals(
  userId: string | undefined,
  offset: number,
) {
  return withSessionDb(async ({ db }) => {
    const result = await getEnrichedProposalData(
      {
        userId: userId,
        offset: offset,
      },
      { db },
    )

    return result
  })
}
