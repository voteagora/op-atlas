// This file is used to export constants that can be safely used in the client-side code

import { optimism, sepolia } from "viem/chains"

export const OFFCHAIN_VOTE_SCHEMA_ID =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0xec3674d93b7007e918cf91ddd44bd14f28d138a4e7f3a79214dc35da2aed794e"
    : "0xTBD"

export const EAS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
    : "0x4200000000000000000000000000000000000021"

export const EAS_VOTE_SCHEMA = "uint256 proposalId,string params"

export const CHAIN_ID =
  process.env.NEXT_PUBLIC_ENV === "dev" ? sepolia.id : optimism.id
