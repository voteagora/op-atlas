import { easClient } from "./client"

type ResponseProps = {
  citizen: string[]
  badgeholder: string[]
  gov_contribution: string[]
  rf_voter: string[]
}
export const getAggregatedData = async (): Promise<ResponseProps> => {
  const records = await easClient("/entities/aggregated", {
    // NOTE: Do we need this? Not sure if our EAS Indexer is publiclly accessible as I see no authorisation anywhere
    // headers: {
    //   Authorization: `Bearer ${process.env.EAS_INDEXER_API_SECRET}`,
    // },
  })
    .then((res) => {
      const data = res.json()

      return data
    })
    .catch((error) => {
      console.error(error)
    })

  return records
}
