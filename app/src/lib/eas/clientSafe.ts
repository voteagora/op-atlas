// This file is used to export constants that can be safely used in the client-side code

import { optimism, optimismSepolia } from "viem/chains"

export const OFFCHAIN_VOTE_SCHEMA_ID = "0xc113116804c90320b3d059ff8eed8b7171e3475f404f65828bbbe260dce15a99"

export const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021"

export const EAS_VOTE_SCHEMA = "uint256 proposalId,string params"

export const CHAIN_ID =
  process.env.NEXT_PUBLIC_ENV === "dev" ? optimismSepolia.id : optimism.id
