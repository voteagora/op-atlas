import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { getDeployedContracts } from "@/lib/oso"
import { OsoDeployerContractsReturnType } from "@/lib/types"

export function useOsoDeployedContracts(
  deployer: string,
  queryOptions?: Partial<
    UseQueryOptions<OsoDeployerContractsReturnType, Error>
  >,
): UseQueryResult<OsoDeployerContractsReturnType, Error> {
  return useQuery({
    queryKey: ["osoDeployerContracts", deployer],
    queryFn: () => getDeployedContracts(deployer),
    ...queryOptions, // Merge custom options
  })
}
