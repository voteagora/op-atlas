import { createFetchClient } from "../common"

const BASE_URL = "atlas-eas-indexer-production.up.railway.app"

const client = createFetchClient(BASE_URL)

export const getCitizen = async (address: string) => {
  try {
    const response = await client(`/citizen/${address}`)
    return response
  } catch (error) {
    return null
  }
}
