import {
  OsoDeployerContractsReturnType,
  ProjectContractsByDeployer,
} from "../types"
import { ProjectContract } from "@prisma/client"

const supportedMappings = {
  OP: "10",
  BASE: "8453",
  MODE: "34443",
}

export function convertContracts(
  data: OsoDeployerContractsReturnType[],
): ProjectContractsByDeployer[] {
  const result: ProjectContractsByDeployer[] = []

  for (const item of data) {
    for (const contract of item.oso_contractsV0) {
      // Find existing entry for this deployer or create a new one
      let entry = result.find(
        (e) => e.deployerAddress === contract.rootDeployerAddress,
      )
      if (!entry) {
        entry = {
          deployerAddress: contract.rootDeployerAddress,
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

export function replaceArtifactSourceWithNumber(
  data: OsoDeployerContractsReturnType[],
) {
  //   console.log("THIS DATA")
  //   console.log(data)
  // Use map to create a new array with the modified data
  return data.map((item) => {
    // If oso_contractsV0 exists and is an array, modify each contract
    if (Array.isArray(item.oso_contractsV0)) {
      item.oso_contractsV0 = item.oso_contractsV0.map((contract) => {
        try {
          // Replace artifactSource with a number
          contract.contractNamespace =
            supportedMappings[
              contract.contractNamespace as keyof typeof supportedMappings
            ].toString()
        } catch (e) {}

        return contract
      })
    }
    return item
  })
}

export function groupByDeployer(deployments: ProjectContract[]): {
  [key: string]: ProjectContractsByDeployer
} {
  const groupedMap: { [key: string]: ProjectContractsByDeployer } = {}

  for (const deployment of deployments) {
    if (!groupedMap[deployment.deployerAddress]) {
      groupedMap[deployment.deployerAddress] = {
        deployerAddress: deployment.deployerAddress,
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
