"use server"

import { getEnrichedProposalData } from "@/lib/proposals"
import { withImpersonation } from "@/lib/db/sessionContext"

// Server action to fetch more proposals
export async function fetchMoreProposals(
  userId: string | undefined,
  offset: number,
) {
  return withImpersonation(async ({ db }) => {
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
