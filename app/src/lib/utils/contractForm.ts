import { ProjectContract } from "@prisma/client"

import {
  OsoDeployerContractsReturnType,
  ProjectContractsByDeployer,
} from "../types"

export function convertContracts(
  data: OsoDeployerContractsReturnType[],
): ProjectContractsByDeployer[] {
  const result: ProjectContractsByDeployer[] = []

  for (const item of data) {
    for (const contract of item.oso_contractsV0) {
      // Find existing entry for this deployer or create a new one
      let entry = result.find((e) => e.address === contract.rootDeployerAddress)
      if (!entry) {
        entry = {
          address: contract.rootDeployerAddress,
          contracts: [],
        }
        result.push(entry)
      }

      // Add contract address if it's not already in the list
      if (
        !entry.contracts.find(
          (entryContract) =>
            entryContract.address === contract.contractAddress &&
            entryContract.chainId === parseInt(contract.contractNamespace),
        )
      ) {
        entry.contracts.push({
          address: contract.contractAddress,
          chainId: Number(contract.contractNamespace),
        })
      }
    }
  }

  return result
}

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
