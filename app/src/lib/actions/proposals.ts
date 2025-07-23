"use server"

import { getEnrichedProposalData } from "@/lib/proposals"

// Server action to fetch more proposals
export async function fetchMoreProposals(
  userId: string | undefined,
  offset: number,
) {
  const result = await getEnrichedProposalData({
    userId: userId,
    offset: offset,
  })

  return result
}
