import { easClient } from "./client"

export type AggregatedDataResponse = {
  citizen: string[]
  badgeholder: string[]
  gov_contribution: string[]
  rf_voter: string[]
}
export const getAggregatedData = async (): Promise<AggregatedDataResponse> => {
  const records = await easClient("/entities/aggregated", {
    // NOTE: Do we need this? Not sure if our EAS Indexer is publiclly accessible as I see no authorisation anywhere
    // headers: {
    //   Authorization: `Bearer ${process.env.EAS_INDEXER_API_SECRET}`,
    // },
  }).catch((error) => {
    console.error(error)
  })

  return records
}
