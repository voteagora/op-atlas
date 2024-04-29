import { isAddress, isHex } from "viem"
import { z } from "zod"

export const Chain = z.enum([
  "Base",
  "Fraxtal",
  "Lisk",
  "Mode",
  "OP Mainnet",
  "Redstone",
  "Zora",
])

const AddressSchema = z.custom<string>(
  (val) => typeof val === "string" && isAddress(val),
  "Valid address is required",
)

const HexStringSchema = z.custom<string>(
  (val) => typeof val === "string" && isHex(val),
  "Valid hash is required",
)

export const ContractSchema = z.object({
  contractAddress: AddressSchema,
  deploymentTxHash: HexStringSchema,
  deployerAddress: AddressSchema,
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

export const ContractsSchema =
  OffChainSchema.or(NoContractsSchema).or(HasContractsSchema)
