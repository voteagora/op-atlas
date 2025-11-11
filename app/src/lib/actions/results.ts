"use server"

import { getFundingRewardsByRoundIdsAndSearchWithClient } from "@/db/rewards"
import { withSessionDb } from "@/lib/db/sessionContext"

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
}) =>
  withSessionDb(async ({ db }) => {
    try {
      const fundingRewardsData =
        await getFundingRewardsByRoundIdsAndSearchWithClient(
          {
            roundIds,
            search,
            sortBy,
            page,
            pageSize,
          },
          db,
        )

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
  })
