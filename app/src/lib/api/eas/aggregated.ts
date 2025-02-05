import { ExtendedAggregatedType } from "@/lib/types"

import { easClient } from "./client"

export const getAggregatedData = async (): Promise<ExtendedAggregatedType> => {
  const records = await easClient("/entities/aggregated", {
    cache: "no-store",
  }).catch((error) => {
    console.error(error)
  })

  return records
}
