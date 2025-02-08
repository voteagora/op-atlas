import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import { Address, createPublicClient, Hash, http } from "viem"
import {
  base,
  bob,
  Chain as ViemChain,
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

import { polynomial } from "@/components/common/chain"

import { Chain } from "./utils/contracts"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is missing from env")
}

export type TraceCall = {
  from: Address
  to: Address | null
  gas: `0x${string}`
  gasUsed: `0x${string}`
  input: `0x${string}`
  output: `0x${string}`
  value: `0x${string}`
  type: "CALL" | "STATICCALL" | "DELEGATECALL" | "CREATE" | "CREATE2"
}

const clients = {
  [Chain.ArenaZ]: createClient(arenaZ, "https://rpc.arena-z.gg"),
  [Chain.Base]: createClient(
    base,
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [Chain.Bob]: createClient(bob, "https://rpc.gobob.xyz"),
  [Chain.Ethernity]: createClient(
    ethernity,
    "https://mainnet.ethernitychain.io",
  ),
  [Chain.Ink]: createClient(ink, "https://rpc-gel.inkonchain.com"),
  [Chain.Lisk]: createClient(lisk, "https://rpc.api.lisk.com"),
  [Chain.MetalL2]: createClient(metalL2, "https://rpc.metall2.com"),
  [Chain.Mint]: createClient(mint, "https://rpc.mintchain.io"),
  [Chain.Mode]: createClient(mode, "https://mainnet.mode.network"),
  [Chain.Optimism]: createClient(
    optimism,
    `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [Chain.Polynomial]: createClient(polynomial, "https://rpc.polynomial.fi"),
  [Chain.Race]: createClient(race, "https://racemainnet.io"),
  [Chain.Shape]: createClient(
    shape,
    `https://shape-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [Chain.Soneium]: createClient(soneium, "https://rpc.soneium.org/"),
  [Chain.Superseed]: createClient(superseed, "https://mainnet.superseed.xyz"),
  [Chain.Swell]: createClient(swell, "https://swell-mainnet.alt.technology"),
  [Chain.Worldchain]: createClient(
    worldchain,
    `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [Chain.Zora]: createClient(zora, "https://rpc.zora.energy"),
}

// We extend the default client to include a trace call for in-depth contract verification
function createClient(chain: ViemChain, url: string) {
  return createPublicClient({
    chain,
    transport: http(url),
  }).extend((client) => ({
    async traceCall(args: { hash: Hash }) {
      return client.request({
        // @ts-expect-error
        method: "debug_traceTransaction",
        // @ts-expect-error
        params: [args.hash, { tracer: "callTracer" }],
      })
    },
  }))
}

export async function getTransaction(hash: `0x${string}`, chain: Chain) {
  const client = clients[chain]
  if (!client) {
    throw new Error(`Client not found for chain ${chain}`)
  }

  try {
    const receipt = await client.getTransactionReceipt({ hash })
    return receipt
  } catch {
    // This happens if the tx couldn't be found
    return null
  }
}

export async function getTransactionTrace(hash: `0x${string}`, chain: Chain) {
  const client = clients[chain]
  if (!client) {
    throw new Error(`Client not found for chain ${chain}`)
  }

  try {
    const trace = await client.traceCall({ hash })
    return trace
  } catch {
    // This happens if the tx couldn't be found
    return null
  }
}
