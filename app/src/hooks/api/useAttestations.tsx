import { useQuery } from "@tanstack/react-query"

import { OP_FOUNDATION_ADDRESSES } from "@/lib/eas/constants"
import { Attestation } from "@/lib/eas/types"

type AttestationWithFoundation = Attestation & {
  isFoundationAttestation: boolean
}

function useAttestations(addresses?: string[]) {
  const queryAddresses = addresses?.filter(Boolean) ?? []

  const { data, isLoading, error } = useQuery({
    queryKey: ["attestations", queryAddresses],
    queryFn: async () => {
      const response = await fetch("/api/eas/attestations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses: queryAddresses }),
        cache: "no-store",
      })

      if (!response.ok) return []

      const attestations = (await response.json()) as Attestation[]

      return attestations.map((attestation) => ({
        ...attestation,
        isFoundationAttestation: isFoundationAttestation(attestation),
      }))
    },
    enabled: queryAddresses.length > 0,
    initialData: [] as AttestationWithFoundation[],
  })

  return { raw: data, isLoading, error }
}

function isFoundationAttestation(attestation: Attestation) {
  return OP_FOUNDATION_ADDRESSES.map((a) => a.toLowerCase()).includes(
    attestation.attester.toLowerCase(),
  )
}

export default useAttestations
