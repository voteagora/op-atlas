import { useQuery } from "@tanstack/react-query"

import { getAttestations } from "@/lib/api/eas/attestations"

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

  return { raw: data, isLoading, error }
}

export default useAttestations
