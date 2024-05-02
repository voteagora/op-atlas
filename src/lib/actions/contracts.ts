"use server"

import { revalidatePath } from "next/cache"
import { Address, getAddress, isAddressEqual, verifyMessage } from "viem"

import { auth } from "@/auth"
import { addProjectContract, getProjectContracts } from "@/db/projects"

import { Chain, getMessage } from "../contractUtils"
import { getTransaction } from "../eth"

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
