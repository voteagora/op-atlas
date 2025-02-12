import { isAddress, isHex } from "viem"
import { Chain } from "../commonSchema"
import { z } from "zod"

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
  name: z.string().optional(),
  description: z.string().optional(),
})

export const HasDeployerKeysOption = z.enum(["Yes", "No", "Some, but not all"])

const OffChainSchema = z.object({
  isOffChain: z.literal(true),
  contracts: z.any(),
  submittedToOSO: z.boolean(),
  osoSlug: z.any(),
})

const HasContractsSchema = z.object({
  isOffChain: z.literal(false),
  contracts: z.array(ContractSchema),
  submittedToOSO: z.boolean(),
  osoSlug: z.string().optional(),
})

const NoContractsSchema = z.object({
  isOffChain: z.literal(false),
  contracts: z.any(),
  submittedToOSO: z.literal(true),
  osoSlug: z.string().optional(),
})

export const ContractsSchema =
  OffChainSchema.or(NoContractsSchema).or(HasContractsSchema)
