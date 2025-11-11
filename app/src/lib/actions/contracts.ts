"use server"

import { revalidatePath } from "next/cache"
import { Address, getAddress, isAddressEqual, verifyMessage } from "viem"

import {
  addProjectContract,
  addProjectContracts,
  getProjectContractsByDeployerWithClient,
  getProjectContractsWithClient,
  removeProjectContract,
  removeProjectContractsByDeployer,
  updateProjectContract,
  upsertProjectContracts,
} from "@/db/projects"
import { getDeployedContractsServerParsed } from "@/lib/oso"
import { SessionDbContext, withSessionDb } from "@/lib/db/sessionContext"

import { UNIVERSAL_CREATE2_FACTORY } from "../constants"
import { clients, getTransaction, getTransactionTrace, TraceCall } from "../eth"
import { Chain, getMessage } from "../utils/contracts"
import { updateProjectDetails } from "./projects"
import { verifyMembership } from "./utils"

type ProjectMemberContext = SessionDbContext & { userId: string }

async function withProjectMember<T>(
  projectId: string,
  handler: (ctx: ProjectMemberContext) => Promise<T>,
) {
  return withSessionDb(async (ctx) => {
    if (!ctx.userId) {
      return {
        error: "Not authenticated",
      } as T
    }

    const membership = await verifyMembership(projectId, ctx.userId, ctx.db)
    if (membership?.error) {
      return membership as T
    }

    return handler({ ...ctx, userId: ctx.userId })
  }, { requireUser: true })
}

export const verifyDeployer = async (
  projectId: string,
  deployerAddress: Address,
  chainId: number,
  signature: `0x${string}`,
) =>
  withProjectMember(projectId, async ({ db }) => {
    const contracts = await getDeployedContractsServerParsed(deployerAddress)

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

    const addedContracts = await addProjectContracts(
      projectId,
      contracts?.map((contract) => ({
        chainId: contract.chainId,
        contractAddress: getAddress(contract.contractAddress),
        deployerAddress: getAddress(deployerAddress),
        projectId,
        deploymentHash: "",
        verificationProof: signature,
        verificationChainId: chainId,
      })) ?? [],
      db,
    )

    return {
      error: null,
      contracts: {
        included: addedContracts.createdContracts,
        excluded: addedContracts.failedContracts,
      },
    }
  })

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
  return withProjectMember(projectId, async ({ db, userId }) => {
    const contractAddress = getAddress(contractAddressRaw)
    const deployerAddress = getAddress(deployerAddressRaw)

    const existingContracts = await getProjectContractsByDeployerWithClient(
      {
        projectId,
        deployerAddress,
      },
      db,
    )

    if (
      existingContracts?.find(
        (contract) =>
          contract.contractAddress === contractAddress &&
          contract.chainId === Number(chain),
      )
    ) {
      return {
        error: "Contract already verified",
      }
    }

    if (existingContracts.length === 0) {
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

    const tx = await getTransaction(deploymentTxHash, chain)
    if (!tx) {
      return {
        error: "Deployment transaction not found",
      }
    }

    const sentByDeployer = isAddressEqual(tx.from, deployerAddress)

    if (tx.contractAddress) {
      if (!isAddressEqual(tx.contractAddress, contractAddress)) {
        return { error: "Contract address doesn't match transaction logs" }
      }
    } else {
      const trace = await getTransactionTrace(deploymentTxHash, chain)
      if (!trace) {
        if (tx.to === null) {
          // proceed
        } else {
          if (
            isAddressEqual(
              tx.to,
              getAddress(UNIVERSAL_CREATE2_FACTORY as Address),
            ) &&
            sentByDeployer &&
            (tx.status as unknown as string) === "success"
          ) {
            // proceed
          } else {
            return { error: "Transaction trace not found" }
          }
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
        if (!sentByDeployer && !involved) {
          return { error: "Deployer not involved in transaction" }
        }
      }
    }

    try {
      const contract = await addProjectContract(
        {
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
        },
        db,
      )

      revalidatePath("/dashboard")
      revalidatePath("/projects", "layout")

      return {
        error: null,
        contract,
      }
    } catch (error: unknown) {
      console.error("Error creating contract", error)
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
  })
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
  return withProjectMember(projectId, async ({ db }) => {
    const contractAddress = getAddress(contractAddressRaw)

    const contract = await updateProjectContract(
      {
        projectId,
        contractAddress,
        chainId,
        updates: {
          name,
          description,
        },
      },
      db,
    )

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      error: null,
      contract,
    }
  })
}

export const removeContractsByDeployer = async (
  projectId: string,
  deployerAddress: Address,
) =>
  withProjectMember(projectId, async ({ db }) => {
    await removeProjectContractsByDeployer(
      projectId,
      getAddress(deployerAddress),
      db,
    )

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      error: null,
    }
  })

export const addAllExcludedProjectContractsAction = async (
  deployer: string,
  projectId: string,
  signature: string,
  verificationChainId: number,
) =>
  withProjectMember(projectId, async ({ db }) => {
    const osoContracts = await getDeployedContractsServerParsed(deployer)
    const projectContracts = await getProjectContractsWithClient(
      { projectId },
      db,
    )

    const excludedContracts =
      osoContracts.filter(
        (c) =>
          !projectContracts?.contracts.some(
            (pc) =>
              pc.contractAddress === c.contractAddress &&
              pc.chainId === c.chainId,
          ),
      ) ?? []

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
        db,
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
  })

export const removeContract = async ({
  projectId,
  address,
  chainId,
}: {
  projectId: string
  address: string
  chainId: number
}) =>
  withProjectMember(projectId, async ({ db }) => {
    await removeProjectContract(
      {
        projectId,
        address,
        chainId,
      },
      db,
    )

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")

    return {
      error: null,
    }
  })

export const updateProjectOSOStatus = async ({
  projectId,
  osoProjectName,
  isSubmittedToOso,
}: {
  projectId: string
  osoProjectName: string | null
  isSubmittedToOso: boolean
}) =>
  withProjectMember(projectId, async () => {
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
  })
