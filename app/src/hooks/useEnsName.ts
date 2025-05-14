import { useQuery } from "@tanstack/react-query"
import { createPublicClient, http } from "viem"
import { getEnsName } from "viem/actions"
import { mainnet } from "viem/chains"

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export function useEnsName(address?: `0x${string}`) {
  return useQuery<string | null>({
    queryKey: ["ensName", address],
    queryFn: async () => {
      if (!address) return null
      try {
        const name = await getEnsName(client, { address })
        return name
      } catch (error) {
        console.error("Error fetching ENS name:", error)
        return null
      }
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
