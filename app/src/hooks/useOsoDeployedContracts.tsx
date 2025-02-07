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

export function useOsoDeployersDeployedContracts(
  deployers: string[],
  queryOptions?: Partial<any>,
  // UseQueryOptions<OsoDeployerContractsReturnType[], Error>
): //UseQueryResult<OsoDeployerContractsReturnType[], Error>
any {
  return useQuery({
    queryKey: ["osoDeployersContracts", deployers],
    queryFn: () =>
      deployers.map(async (deployer) => {
        return await getDeployedContracts(deployer)
      }),
    ...queryOptions, // Merge custom options
  })
}
