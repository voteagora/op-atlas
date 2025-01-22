import { z } from "zod"
import { base, fraxtal, liskSepolia, mode, optimism, zora } from "viem/chains"
import { isAddress, isHex } from "viem"

export const Chain = z.enum([
  base.id.toString(),
  fraxtal.id.toString(),
  mode.id.toString(),
  optimism.id.toString(),
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
