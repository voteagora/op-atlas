import { z } from "zod"
import { AddressSchema, Chain } from "./commonSchema"

export const ContractSchema2 = z.object({
  contractAddress: AddressSchema,
  chain: Chain,
  name: z.string().optional(),
  description: z.string().optional(),
  selected: z.boolean(),
})

export const DeployerSchema = z.object({
  deployerAddress: AddressSchema,
  contracts: z.array(ContractSchema2),
})

const OffChainSchema2 = z.object({
  isOffChain: z.literal(true),
  deployers: z.any(),
  submittedToOSO: z.any(),
  osoSlug: z.any(),
})

const HasContractsSchema2 = z.object({
  isOffChain: z.literal(false),
  deployers: z.array(DeployerSchema),
  submittedToOSO: z.boolean(),
  osoSlug: z.string().optional(),
})

const NoContractsSchema2 = z.object({
  isOffChain: z.literal(false),
  deployers: z.any(),
  submittedToOSO: z.literal(true),
  osoSlug: z.string().optional(),
})

export const ContractsSchema2 =
  OffChainSchema2.or(NoContractsSchema2).or(HasContractsSchema2)
