import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { isAddress } from "viem"

import { getParsedDeployedContracts } from "@/lib/oso"
import { ParsedOsoDeployerContract } from "@/lib/types"

export function useOsoDeployedContracts(
  deployer: string,
  queryOptions?: Partial<UseQueryOptions<ParsedOsoDeployerContract[], Error>>,
): UseQueryResult<ParsedOsoDeployerContract[], Error> {
  const isValidDeployer = typeof deployer === "string" && isAddress(deployer)

  return useQuery({
    queryKey: ["osoDeployerContracts", deployer],
    queryFn: () =>
      isValidDeployer ? getParsedDeployedContracts(deployer) : [],
    enabled: isValidDeployer,
    ...queryOptions,
  })
}
