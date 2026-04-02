"use server"

import { getEnrichedProposalData } from "@/lib/proposals"
import { withImpersonation } from "@/lib/db/sessionContext"

// Server action to fetch more proposals
export async function fetchMoreProposals(offset: number) {
  return withImpersonation(async ({ db, userId }) => {
    const result = await getEnrichedProposalData(
      {
        userId: userId ?? undefined,
        offset: offset,
      },
      { db },
    )

    return result
  })
}
