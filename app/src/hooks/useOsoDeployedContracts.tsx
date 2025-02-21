import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"

import { getParsedDeployedContracts } from "@/lib/oso"
import { ParsedOsoDeployerContract } from "@/lib/types"

export function useOsoDeployedContracts(
  deployer: string,
  queryOptions?: Partial<UseQueryOptions<ParsedOsoDeployerContract[], Error>>,
): UseQueryResult<ParsedOsoDeployerContract[], Error> {
  return useQuery({
    queryKey: ["osoDeployerContracts", deployer],
    queryFn: () => getParsedDeployedContracts(deployer),
    ...queryOptions,
  })
}
