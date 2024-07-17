"use server"

import { getFundingRewardsByRoundIdAndSearch } from "@/db/rewards"

export const findFundingRewards = async ({
  roundId,
  search,
  sortBy,
  page,
  pageSize,
}: {
  roundId: string
  search: string
  sortBy: "asc" | "desc"
  page: number
  pageSize: number
}) => {
  try {
    const fundingRewardsData = await getFundingRewardsByRoundIdAndSearch({
      roundId,
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
