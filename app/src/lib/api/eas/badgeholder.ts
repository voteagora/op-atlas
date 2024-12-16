import { Badgeholder } from "eas-indexer/src/types"

import { easClient } from "./client"

export const getBadgeholder = async (
  address: string,
): Promise<Badgeholder | null> => {
  try {
    const response = await easClient(`badgeholder/${address}`)
    return response
  } catch (error) {
    return null
  }
}