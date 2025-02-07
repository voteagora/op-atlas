import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { getAllProjectContracts } from "@/db/projects"
import { ProjectContract } from "@prisma/client"
import { getDeployedContracts } from "@/lib/oso"
import { OsoDeployerContractsReturnType } from "@/components/projects/contracts/mockDBData"

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
