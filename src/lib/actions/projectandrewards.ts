"use server"

import { getFundingRewardsByRoundIdAndSearch } from "@/db/rewards"

export const findFundingRewards = async ({
  roundId,
  search,
  sortByAmount,
  page,
  pageSize,
}: {
  roundId: string
  search: string
  sortByAmount: "asc" | "desc"
  page: number
  pageSize: number
}) => {
  try {
    const fundingRewardsData = await getFundingRewardsByRoundIdAndSearch({
      roundId,
      search,
      sortByAmount,
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
