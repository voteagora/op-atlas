import { z } from "zod"
import { ProjectWithDetails } from "@/lib/types"

export const Chain = z.enum([
  "Base",
  "Fraxtal",
  "Lisk",
  "Mode",
  "OP Mainnet",
  "Redstone",
  "Zora",
])

const ContractSchema = z.object({
  contractAddress: z.string().min(1, "Contract address is required"),
  deploymentTxHash: z
    .string()
    .min(1, "Deployment transaction hash is required"),
  deployerAddress: z.string().min(1, "Deployer address is required"),
  chain: Chain,
  signature: z.string().optional(),
})

export const HasDeployerKeysOption = z.enum(["Yes", "No", "Some, but not all"])

export const ContractsSchema = z.object({
  isOnChain: z.boolean(),
  hasDeployerKeys: HasDeployerKeysOption,
  contracts: z.array(ContractSchema).optional(),
  submittedToOSO: z.boolean(),
})
