import { polynomial } from "@/components/common/chain"
import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import { isAddress, isHex } from "viem"
import {
  base,
  fraxtal,
  ink,
  lisk,
  metalL2,
  mode,
  optimism,
  shape,
  soneium,
  superseed,
  worldchain,
  zora,
} from "viem/chains"
import { z } from "zod"

export const Chain = z.enum([
  arenaZ.id.toString(),
  base.id.toString(),
  ethernity.id.toString(),
  fraxtal.id.toString(),
  ink.id.toString(),
  lisk.id.toString(),
  metalL2.id.toString(),
  mode.id.toString(),
  optimism.id.toString(),
  polynomial.id.toString(),
  race.id.toString(),
  shape.id.toString(),
  soneium.id.toString(),
  superseed.id.toString(),
  swell.id.toString(),
  worldchain.id.toString(),
  zora.id.toString(),
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
