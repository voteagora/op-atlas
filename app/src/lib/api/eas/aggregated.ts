import { AggregatedType } from "eas-indexer/src/types"

import { easClient } from "./client"

export const getAggregatedData = async (): Promise<AggregatedType> => {
  const records = await easClient("/entities/aggregated", {
    cache: "no-store",
  }).catch((error) => {
    console.error(error)
  })

  return records
}
