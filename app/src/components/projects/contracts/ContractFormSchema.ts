import { atlasSupportedChains } from "@/lib/utils/contracts"
import { isAddress, isHex } from "viem"
import { z } from "zod"

export const Chain = z.enum(
  Object.values(atlasSupportedChains).map((chain) => chain.id.toString()) as [
    string,
    ...string[],
  ],
)

export const AddressSchema = z.custom<string>(
  (val) => typeof val === "string" && (isAddress(val) || val === ""),
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
  verificationChainId: z.string(),
})

// Separate URL and slug patterns for clarity
const defillamaUrlPattern =
  /^https:\/\/defillama\.com\/protocol\/[a-zA-Z0-9-]+$/i

export const DefiLlamaSchema = z.object({
  slug: z
    .string()
    .regex(defillamaUrlPattern, "Invalid DefiLlama protocol URL")
    .optional(),
})

export const DeployersSchema = z.object({
  submittedToOSO: z.boolean(),
  isOffChain: z.boolean(),
  osoSlug: z.string(),
  defillamaSlug: z.array(DefiLlamaSchema),
  deployers: z.array(DeployerSchema),
})

export function formatDefillamaSlug(slug: string) {
  if (slug.startsWith("https://defillama.com/protocol/")) {
    return slug.replace("https://defillama.com/protocol/", "")
  }
  return slug
}

export function reverseFormatDefillamaSlug(slug: string) {
  return `https://defillama.com/protocol/${slug}`
}
