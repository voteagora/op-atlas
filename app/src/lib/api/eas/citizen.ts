import { Citizen } from "eas-indexer/src/types"

import { easClient } from "./client"

export const getCitizen = async (address: string): Promise<Citizen | null> => {
  try {
    const response = await easClient(`/citizen/${address}`)
    return response
  } catch (error) {
    return null
  }
}
