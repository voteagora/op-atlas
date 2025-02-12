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
    ...queryOptions,
  })
}

export function useOsoDeployersDeployedContracts(
  deployers: string[],
  queryOptions?: Partial<
    UseQueryOptions<OsoDeployerContractsReturnType[], Error>
  >,
): UseQueryResult<OsoDeployerContractsReturnType[], Error> {
  return useQuery({
    queryKey: ["osoDeployersContracts", deployers],
    queryFn: async () => {
      const deployedContracts = await Promise.all(
        deployers.map((deployer) => getDeployedContracts(deployer)),
      )
      return deployedContracts
    },
    ...queryOptions,
  })
}
