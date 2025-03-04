// import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import { Address, createPublicClient, Hash, http } from "viem"
import { atlasSupportedChains } from "./utils/contracts"
import {
  // base,
  // bob,
  Chain as ViemChain,
  // ink,
  // lisk,
  // metalL2,
  // mint,
  // mode,
  // optimism,
  // shape,
  // soneium,
  // superseed,
  // unichain,
  // worldchain,
  // zora,
} from "viem/chains"

// import { polynomial } from "@/components/common/chain"

// import { Chain } from "./utils/contracts"

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

export const clients = {
  [atlasSupportedChains.arenaZ.id]: createClient(
    atlasSupportedChains.arenaZ,
    "https://rpc.arena-z.gg",
  ),
  [atlasSupportedChains.base.id]: createClient(
    atlasSupportedChains.base,
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [atlasSupportedChains.bob.id]: createClient(
    atlasSupportedChains.bob,
    "https://rpc.gobob.xyz",
  ),
  [atlasSupportedChains.ethernity.id]: createClient(
    atlasSupportedChains.ethernity,
    "https://mainnet.ethernitychain.io",
  ),
  [atlasSupportedChains.ink.id]: createClient(
    atlasSupportedChains.ink,
    `https://ink-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [atlasSupportedChains.lisk.id]: createClient(
    atlasSupportedChains.lisk,
    "https://rpc.api.lisk.com",
  ),
  [atlasSupportedChains.metalL2.id]: createClient(
    atlasSupportedChains.metalL2,
    "https://rpc.metall2.com",
  ),
  [atlasSupportedChains.mint.id]: createClient(
    atlasSupportedChains.mint,
    "https://rpc.mintchain.io",
  ),
  [atlasSupportedChains.mode.id]: createClient(
    atlasSupportedChains.mode,
    "https://mainnet.mode.network",
  ),
  [atlasSupportedChains.optimism.id]: createClient(
    atlasSupportedChains.optimism,
    `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [atlasSupportedChains.polynomial.id]: createClient(
    atlasSupportedChains.polynomial,
    "https://rpc.polynomial.fi",
  ),
  [atlasSupportedChains.race.id]: createClient(
    atlasSupportedChains.race,
    "https://racemainnet.io",
  ),
  [atlasSupportedChains.shape.id]: createClient(
    atlasSupportedChains.shape,
    `https://shape-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [atlasSupportedChains.soneium.id]: createClient(
    atlasSupportedChains.soneium,
    `https://rpc.soneium.org`,
  ),
  [atlasSupportedChains.superseed.id]: createClient(
    atlasSupportedChains.superseed,
    "https://mainnet.superseed.xyz",
  ),
  [atlasSupportedChains.swell.id]: createClient(
    atlasSupportedChains.swell,
    "https://swell-mainnet.alt.technology",
  ),
  [atlasSupportedChains.unichain.id]: createClient(
    atlasSupportedChains.unichain,
    "https://mainnet.unichain.org",
  ),
  [atlasSupportedChains.worldchain.id]: createClient(
    atlasSupportedChains.worldchain,
    `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [atlasSupportedChains.zora.id]: createClient(
    atlasSupportedChains.zora,
    "https://rpc.zora.energy",
  ),
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

export async function getTransaction(hash: `0x${string}`, chainId: number) {
  const client = clients[chainId]
  if (!client) {
    throw new Error(`Client not found for chain ${chainId}`)
  }

  try {
    const receipt = await client.getTransactionReceipt({ hash })
    return receipt
  } catch {
    // This happens if the tx couldn't be found
    return null
  }
}

export async function getTransactionTrace(
  hash: `0x${string}`,
  chainId: number,
) {
  const client = clients[chainId]
  if (!client) {
    throw new Error(`Client not found for chain ${chainId}`)
  }

  try {
    const trace = await client.traceCall({ hash })
    return trace
  } catch {
    // This happens if the tx couldn't be found
    return null
  }
}
