import { ProjectContract } from "@prisma/client"

import { ProjectContractsByDeployer } from "../types"

export function groupByDeployer(deployments: ProjectContract[]): {
  [key: string]: ProjectContractsByDeployer
} {
  const groupedMap: { [key: string]: ProjectContractsByDeployer } = {}

  for (const deployment of deployments) {
    if (!groupedMap[deployment.deployerAddress]) {
      groupedMap[deployment.deployerAddress] = {
        address: deployment.deployerAddress,
        contracts: [],
      }
    }
    groupedMap[deployment.deployerAddress].contracts.push({
      address: deployment.contractAddress,
      chainId: deployment.chainId,
    })
  }

  // Convert the map to an array
  return groupedMap
}
