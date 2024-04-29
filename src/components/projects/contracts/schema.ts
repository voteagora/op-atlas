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

const OffChainSchema = z.object({
  isOffChain: z.literal(true),
  hasDeployerKeys: z.any(),
  contracts: z.any(),
  submittedToOSO: z.any(),
})

const HasContractsSchema = z.object({
  isOffChain: z.literal(false),
  hasDeployerKeys: HasDeployerKeysOption.exclude(["No"]),
  contracts: z.array(ContractSchema),
  submittedToOSO: z.boolean(),
})

const NoContractsSchema = z.object({
  isOffChain: z.literal(false),
  hasDeployerKeys: HasDeployerKeysOption.extract(["No"]),
  contracts: z.any(),
  submittedToOSO: z.literal(true),
})

export const ContractsSchema = OffChainSchema.or(NoContractsSchema)
  .or(HasContractsSchema)
  .or(NoContractsSchema)
