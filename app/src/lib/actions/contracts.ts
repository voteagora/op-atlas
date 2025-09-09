"use server"

import { revalidatePath } from "next/cache"
import { Address, getAddress, isAddressEqual, verifyMessage } from "viem"

import { auth } from "@/auth"
import {
  addProjectContract,
  addProjectContracts,
  getProjectContracts,
  getProjectContractsByDeployer,
  removeProjectContract,
  removeProjectContractsByDeployer,
  updateProjectContract,
  upsertProjectContracts,
} from "@/db/projects"
import { getDeployedContractsServerParsed } from "@/lib/oso"

import { clients, getTransaction, getTransactionTrace, TraceCall } from "../eth"
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
    getDeployedContractsServerParsed(deployerAddress),
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
    contracts?.map((contract) => {
      return {
        chainId: contract.chainId,
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
  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, userId)
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

  console.log("existingContracts", existingContracts)

  // If the contract is already verified, return
  if (
    existingContracts?.find(
      (contract) =>
        contract.contractAddress === contractAddress &&
        contract.chainId === parseInt(chain.toString()),
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

  // Validate deployer involvement and contract creation
  const sentByDeployer = isAddressEqual(tx.from, deployerAddress)

  // If receipt provides contractAddress, ensure it matches
  if (tx.contractAddress) {
    if (!isAddressEqual(tx.contractAddress, contractAddress)) {
      return { error: "Contract address doesn't match transaction logs" }
    }
  } else {
    // No contractAddress on receipt. Try trace to locate CREATE/CREATE2 to target
    const trace = await getTransactionTrace(deploymentTxHash, chain)
    if (!trace) {
      // Fallback: contract creation txs often have `to === null`. If so, accept.
      if (tx.to === null) {
        // proceed without trace
      } else {
        return { error: "Transaction trace not found" }
      }
    } else {
      const calls = (trace as any).calls as TraceCall[]

      const findCreation = (nodes: TraceCall[]): boolean => {
        for (const node of nodes) {
          if (
            (node.type === "CREATE" || node.type === "CREATE2") &&
            node.to !== null &&
            isAddressEqual(node.to, contractAddress)
          ) {
            return true
          }
          const nested: any = (node as any).calls
          if (Array.isArray(nested) && nested.length > 0) {
            if (findCreation(nested as TraceCall[])) return true
          }
        }
        return false
      }

      const findDeployerInvolvement = (nodes: TraceCall[]): boolean => {
        for (const node of nodes) {
          if (isAddressEqual(node.from, deployerAddress)) return true
          const nested: any = (node as any).calls
          if (Array.isArray(nested) && nested.length > 0) {
            if (findDeployerInvolvement(nested as TraceCall[])) return true
          }
        }
        return false
      }

      const created = findCreation(calls)
      if (!created) {
        return { error: "Contract creation not found in transaction" }
      }

      const involved = findDeployerInvolvement(calls)
      // If the deployer didn't send the tx, ensure they were involved in the call graph
      if (!sentByDeployer && !involved) {
        return { error: "Deployer not involved in transaction" }
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
  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, userId)
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
  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, userId)
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

export const addAllExcludedProjectContractsAction = async (
  deployer: string,
  projectId: string,
  signature: string,
  verificationChainId: number,
) => {
  const result = await verifyAuthenticatedMember(projectId)
  if (result.error !== null) return { error: result.error }

  const osoContracts = await getDeployedContractsServerParsed(deployer)
  const projectContracts = await getProjectContracts({
    projectId,
  })

  const excludedContracts = osoContracts.filter((c) => {
    return !projectContracts?.contracts.some(
      (pc) =>
        pc.contractAddress === c.contractAddress && pc.chainId === c.chainId,
    )
  })

  try {
    await upsertProjectContracts(
      projectId,
      excludedContracts.map((c) => ({
        contractAddress: c.contractAddress,
        chainId: c.chainId,
        verificationProof: signature,
        verificationChainId,
        deployerAddress: deployer,
        deploymentHash: "",
        projectId,
      })),
    )
  } catch (error: unknown) {
    console.error("Error adding all contracts", error)
    return {
      error: "Error adding all contracts",
    }
  }

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
  const userId = session?.user?.id
  if (!userId) {
    return {
      error: "Not authenticated",
    }
  }

  const isInvalid = await verifyMembership(projectId, userId)
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
