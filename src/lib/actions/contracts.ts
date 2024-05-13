"use server"

import { revalidatePath } from "next/cache"
import { project } from "ramda"
import { Address, getAddress, isAddressEqual, verifyMessage } from "viem"

import { auth } from "@/auth"
import {
  addProjectContract,
  getProjectContracts,
  removeProjectContract,
} from "@/db/projects"

import { getTransaction } from "../eth"
import { Chain, getMessage } from "../utils/contracts"
import { updateProjectDetails } from "./projects"
import { verifyMembership } from "./utils"

export const verifyContract = async ({
  projectId,
  contractAddress: contractAddressRaw,
  deployerAddress: deployerAddressRaw,
  deploymentTxHash,
  signature,
  chain,
}: {
  projectId: string
  contractAddress: Address
  deployerAddress: Address
  deploymentTxHash: `0x${string}`
  signature: `0x${string}`
  chain: Chain
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
  const existingContracts = await getProjectContracts({
    projectId,
    deployerAddress,
  })

  if (existingContracts.length === 0) {
    // Verify that the deployer is the one that signed the message
    const isValidSignature = await verifyMessage({
      address: deployerAddress,
      message: getMessage(deployerAddress),
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
      error: "Transaction not found",
    }
  }

  const didSendTx = isAddressEqual(tx.from, deployerAddress)
  const didCreateContract =
    tx.contractAddress && isAddressEqual(tx.contractAddress, contractAddress)

  if (!didSendTx || !didCreateContract) {
    return {
      error: "Invalid transaction",
    }
  }

  const contract = await addProjectContract({
    projectId,
    contract: {
      contractAddress,
      deployerAddress,
      deploymentHash: deploymentTxHash,
      verificationProof: signature,
      chainId: parseInt(chain.toString()),
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
    contract,
  }
}

export const removeContract = async ({
  projectId,
  address: contractAddressRaw,
  chainId,
}: {
  projectId: string
  address: Address
  chainId: number
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

  await removeProjectContract({
    projectId,
    address: contractAddress,
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
}: {
  projectId: string
  osoProjectName: string | null
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
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
    project,
  }
}
