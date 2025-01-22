import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { agoraClient } from "@/app/api/agora/common"

// TODO: Import from Agora swagger
type DelegateData = {
  address: string
  votingPower: {
    total: string
    direct: string
    advanced: string
  }
  numOfDelegators: string
}

const useDelegateData = (addresses: string[]) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["agora-delegate", addresses],
    queryFn: async () => {
      const results = await Promise.all(
        addresses.map(async (address) => {
          const response = await fetch(`/api/agora/delegate/${address}`)
          return response.json()
        }),
      )
      return results.map((delegate) => ({
        ...delegate,
        votingPower: formatVotingPower(delegate.votingPower),
      })) as DelegateData[]
    },
  })

  // Pick delegate with the highest voting power
  const delegate = data?.reduce((max, delegate) => {
    if (delegate.votingPower.total > max.votingPower.total) {
      return delegate
    }
    return max
  }, data[0])

  return { delegate, isLoading, error }
}

function formatVotingPower(votingPower: DelegateData["votingPower"]) {
  return {
    total: formatUnits(BigInt(votingPower.total), 18),
    direct: formatUnits(BigInt(votingPower.direct), 18),
    advanced: formatUnits(BigInt(votingPower.advanced), 18),
  }
}

export default useDelegateData
