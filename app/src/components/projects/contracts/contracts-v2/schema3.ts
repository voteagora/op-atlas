import { z } from "zod"
import { AddressSchema, Chain } from "../commonSchema"

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
})

export const DeployersSchema = z.object({
  deployers: z.array(DeployerSchema),
  submittedToOSO: z.boolean(),
  isOffChain: z.boolean(),
  osoSlug: z.string(),
  defillamaAdapter: z.string(),
})
