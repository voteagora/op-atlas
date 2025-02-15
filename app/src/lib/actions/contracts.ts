"use server"

import { revalidatePath } from "next/cache"
import { Address, getAddress, isAddressEqual, verifyMessage } from "viem"

import { getDeployedContractsServer } from "@/app/api/oso/common"
import { auth } from "@/auth"
import {
  addProjectContract,
  addProjectContracts,
  getProjectContractsByDeployer,
  removeProjectContract,
  removeProjectContractsByDeployer,
  updateProjectContract,
} from "@/db/projects"

import { clients, getTransaction, getTransactionTrace, TraceCall } from "../eth"
import { osoNamespaceToChainId } from "../utils/contractForm"
import { Chain, getMessage } from "../utils/contracts"
import { updateProjectDetails } from "./projects"
import { verifyMembership } from "./utils"

export const verifyDeployer = async (
  projectId: string,
  deployerAddress: Address,
  chainId: number,
  signature: `0x${string}`,
) => {
  const [contracts, result] = await Promise.all([
    getDeployedContractsServer(deployerAddress),
    verifyAuthenticatedMember(projectId),
  ])
  if (result.error !== null) return result

  const client = clients[chainId]

  const isValidSignature = await client.verifyMessage({
    address: getAddress(deployerAddress),
    message: getMessage(projectId),
    signature: signature as `0x${string}`,
  })

  if (!isValidSignature) {
    return {
      error: "Invalid signature",
    }
  }

  // Add all contracts to the DB
  const addedContracts = await addProjectContracts(
    projectId,
    contracts?.oso_contractsV0.map((contract) => {
      return {
        chainId: osoNamespaceToChainId(contract.contractNamespace),
        contractAddress: getAddress(contract.contractAddress),
        deployerAddress: getAddress(deployerAddress),
        projectId,
        deploymentHash: "",
        verificationProof: signature,
        verificationChainId: chainId,
      }
    }),
  )

  return {
    error: null,
    contracts: {
      included: addedContracts.createdContracts,
      excluded: addedContracts.failedContracts,
    },
  }
}

export const verifyContract = async ({
  projectId,
  contractAddress: contractAddressRaw,
  deployerAddress: deployerAddressRaw,
  deploymentTxHash,
  signature,
  chain,
  name,
  description,
}: {
  projectId: string
  contractAddress: Address
  deployerAddress: Address
  deploymentTxHash: `0x${string}`
  signature: `0x${string}`
  chain: Chain
  name?: string
  description?: string
}) => {
  const session = await auth()
  if (!session) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const contractAddress = getAddress(contractAddressRaw)
  const deployerAddress = getAddress(deployerAddressRaw)

  // Fetch other contracts from this proejct with the same deployer address
  const existingContracts = await getProjectContractsByDeployer({
    projectId,
    deployerAddress,
  })

  // If the contract is already verified, return
  if (
    existingContracts?.find(
      (contract) => contract.contractAddress === contractAddress,
    )
  ) {
    return {
      error: "Contract already verified",
    }
  }

  if (existingContracts.length === 0) {
    // Verify that the deployer is the one that signed the message
    const isValidSignature = await verifyMessage({
      address: deployerAddress,
      message: getMessage(projectId),
      signature: signature as `0x${string}`,
    })

    if (!isValidSignature) {
      return {
        error: "Invalid signature",
      }
    }
  }

  // Get the tx and ensure the deployer is the one who created the contract
  const tx = await getTransaction(deploymentTxHash, chain)
  if (!tx) {
    return {
      error: "Deployment transaction not found",
    }
  }

  // If the deployer didn't send the tx, it's definitely not valid
  if (!isAddressEqual(tx.from, deployerAddress)) {
    return {
      error: "Transaction not sent by deployer",
    }
  }

  // Simple case: the tx has a contract field that matches the contract address
  if (
    tx.contractAddress &&
    !isAddressEqual(tx.contractAddress, contractAddress)
  ) {
    return {
      error: "Contract address doesn't match transaction logs",
    }
  }

  // More complex case: use the trace to see if a create2 call was used to deploy
  if (!tx.contractAddress) {
    const trace = await getTransactionTrace(deploymentTxHash, chain)
    if (!trace) {
      return {
        error: "Transaction trace not found",
      }
    }

    const calls = (trace as any).calls as TraceCall[]
    const creation = calls.find((call) => {
      return (
        call.type === "CREATE2" &&
        call.to !== null &&
        isAddressEqual(call.to, contractAddress)
      )
    })

    if (!creation) {
      return {
        error: "Contract creation not found in transaction",
      }
    }
  }

  // Must be valid!

  try {
    const contract = await addProjectContract({
      projectId,
      contract: {
        contractAddress,
        deployerAddress,
        deploymentHash: deploymentTxHash,
        verificationProof: signature,
        chainId: parseInt(chain.toString()),
        name,
        description,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      error: null,
      contract,
    }
  } catch (error: unknown) {
    console.error("Error creating contract", error)
    // Handle the case where another project has used this contract
    if (
      error instanceof Error &&
      error.message.includes(
        "Unique constraint failed on the fields: (`contractAddress`,`chainId`)",
      )
    ) {
      return {
        error: "This contract is already verified",
      }
    }

    return {
      error: "Error creating contract",
    }
  }
}

export const updateContractDetails = async ({
  projectId,
  contractAddress: contractAddressRaw,
  chainId,
  name,
  description,
}: {
  projectId: string
  contractAddress: Address
  chainId: number
  name?: string
  description?: string
}) => {
  const session = await auth()
  if (!session) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const contractAddress = getAddress(contractAddressRaw)

  const contract = await updateProjectContract({
    projectId,
    contractAddress,
    chainId,
    updates: {
      name,
      description,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
    contract,
  }
}

async function verifyAuthenticatedMember(projectId: string) {
  const session = await auth()
  if (!session) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  return {
    error: null,
  }
}

export const removeContractsByDeployer = async (
  projectId: string,
  deployerAddress: Address,
) => {
  const result = await verifyAuthenticatedMember(projectId)
  if (result.error !== null) return result.error

  await removeProjectContractsByDeployer(projectId, deployerAddress)

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
  }
}

export const removeContract = async ({
  projectId,
  address,
  chainId,
}: {
  projectId: string
  address: string
  chainId: number
}) => {
  const result = await verifyAuthenticatedMember(projectId)
  if (result.error !== null) return result.error

  await removeProjectContract({
    projectId,
    address,
    chainId,
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
  }
}

export const updateProjectOSOStatus = async ({
  projectId,
  osoProjectName,
  isSubmittedToOso,
}: {
  projectId: string
  osoProjectName: string | null
  isSubmittedToOso: boolean
}) => {
  const session = await auth()
  if (!session) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const project = await updateProjectDetails(projectId, {
    openSourceObserverSlug: osoProjectName,
    isSubmittedToOso: isSubmittedToOso,
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
    project,
  }
}
