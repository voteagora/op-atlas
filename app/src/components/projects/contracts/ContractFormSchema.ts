import { z } from "zod"
import { isAddress, isHex } from "viem"
import {
  base,
  bob,
  ink,
  lisk,
  metalL2,
  mint,
  mode,
  optimism,
  shape,
  soneium,
  superseed,
  worldchain,
  zora,
} from "viem/chains"
import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import { polynomial } from "@/components/common/chain"

export const Chain = z.enum([
  arenaZ.id.toString(),
  base.id.toString(),
  bob.id.toString(),
  ethernity.id.toString(),
  ink.id.toString(),
  lisk.id.toString(),
  metalL2.id.toString(),
  mint.id.toString(),
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

export const AddressSchema = z.custom<string>(
  (val) => typeof val === "string" && isAddress(val),
  "Valid address is required",
)

export const HexStringSchema = z.custom<string>(
  (val) => typeof val === "string" && isHex(val),
  "Valid hash is required",
)

export const ContractSchema = z.object({
  address: AddressSchema,
  chainId: Chain,
  //   name: z.string().optional(),
  //   description: z.string().optional(),
  excluded: z.boolean(),
})

export const DeployerSchema = z.object({
  address: AddressSchema,
  contracts: z.array(ContractSchema),
  signature: z.string(),
})

export const DeployersSchema = z.object({
  deployers: z.array(DeployerSchema),
  submittedToOSO: z.boolean(),
  isOffChain: z.boolean(),
  osoSlug: z.string(),
  defillamaSlug: z.string(),
})
