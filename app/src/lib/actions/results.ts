"use server"

import { getFundingRewardsByRoundIdsAndSearch } from "@/db/rewards"

export const findFundingRewards = async ({
  roundIds,
  search,
  sortBy,
  page,
  pageSize,
}: {
  roundIds: string[]
  search: string
  sortBy: "asc" | "desc"
  page: number
  pageSize: number
}) => {
  try {
    const fundingRewardsData = await getFundingRewardsByRoundIdsAndSearch({
      roundIds,
      search,
      sortBy,
      page,
      pageSize,
    })

    return {
      error: null,
      fundingRewards: fundingRewardsData ?? null,
    }
  } catch (error: unknown) {
    console.error("Error fetching funding rewards", (error as Error).message)
    return {
      error: "Error fetching funding rewards",
    }
  }
}
