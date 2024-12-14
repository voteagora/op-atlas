import { Citizen } from "eas-indexer/src/types"

import { createFetchClient } from "../common"

const BASE_URL = "atlas-eas-indexer-production.up.railway.app"

const client = createFetchClient(BASE_URL)

export const getCitizen = async (address: string): Promise<Citizen | null> => {
  try {
    const response = await client(`/citizen/${address}`)
    return response
  } catch (error) {
    return null
  }
}
