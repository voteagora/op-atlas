import { Attestation } from "eas-indexer/src/types"

import { easClient } from "./client"

export const getAttestations = async (
  address: string,
): Promise<Attestation[]> => {
  try {
    const response = await easClient(`/attestations/${address}`)
    return response
  } catch (error) {
    return []
  }
}
