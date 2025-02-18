import { ProjectContract } from "@prisma/client"

import {
  OsoDeployerContractsReturnType,
  ProjectContractsByDeployer,
} from "../types"

const supportedMappings = {
  OP: 10,
  BASE: 8453,
  MODE: 34443,
  WORLDCHAIN: 480,
  POLYNOMIAL: 8008,
  BOB: 60808,
  INK: 57073,
  LISK: 1135,
  METALL2: 1750,
  MINT: 185,
  RACE: 6805,
  SHAPE: 360,
  SONEIUM: 1868,
  SWELL: 1923,
  ZORA: 7777777,
}

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

export function osoNamespaceToChainId(namespace: string) {
  return supportedMappings[namespace as keyof typeof supportedMappings]
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
