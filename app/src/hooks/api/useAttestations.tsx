import { useQuery } from "@tanstack/react-query"
import { OP_FOUNDATION_ADDRESSES } from "eas-indexer/schemas.config"
import { Attestation } from "eas-indexer/src/types"

import { getAttestations } from "@/lib/api/eas/attestations"

function useAttestations(addresses: string[]) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["attestations", addresses],
    queryFn: async () => {
      const results = await Promise.all(
        addresses.map((address) => getAttestations(address)),
      )
      return results.flat().map((attestation) => ({
        ...attestation,
        isFoundationAttestation: isFoundationAttestation(attestation),
      }))
    },
  })

  return { raw: data, isLoading, error }
}

function isFoundationAttestation(attestation: Attestation) {
  return OP_FOUNDATION_ADDRESSES.map((a) => a.toLowerCase()).includes(
    attestation.attester as `0x${string}`,
  )
}

export default useAttestations
