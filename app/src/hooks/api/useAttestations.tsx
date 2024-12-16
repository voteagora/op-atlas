import { useQuery } from "@tanstack/react-query"
import { Attestation } from "eas-indexer/src/types"

import { getAttestations } from "@/lib/api/eas/attestations"

type ParsedAttestation = {
  id: string
  name: string
  address: string
  subtext: string
}

function useAttestations(addresses: string[]) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["attestations", addresses],
    queryFn: async () => {
      const results = await Promise.all(
        addresses.map((address) => getAttestations(address)),
      )
      return results.flat()
    },
  })

  return { raw: data, merged: mergeAttestations(data), isLoading, error }
}

function mergeAttestations(attestations?: Attestation[]) {
  if (!attestations) return []

  // Group attestations by entity and merge subtext
  const groupedAttestations = attestations.reduce((acc, attestation) => {
    if (!acc[attestation.entity]) {
      acc[attestation.entity] = {
        id: attestation.id,
        entity: attestation.entity,
        address: attestation.address,
        subtext: attestation.subtext,
      }
    } else {
      // Append new subtext if not already included
      if (!acc[attestation.entity].subtext.includes(attestation.subtext)) {
        acc[attestation.entity].subtext += `, ${attestation.subtext}`
      }
    }
    return acc
  }, {} as Record<string, Attestation>)

  return Object.values(groupedAttestations).map(parseAttestation)
}

const entityNameMap = {
  citizen: "Citizen",
  badgeholder: "Badgeholder",
  gov_contribution: "Governance Contribution",
  rf_voter: "Retro Funding Voter",
}

function parseAttestation(attestation: Attestation): ParsedAttestation {
  const { id, entity, address, subtext } = attestation
  const name = entityNameMap[entity as keyof typeof entityNameMap]
  return { id, name, address, subtext }
}

export default useAttestations
