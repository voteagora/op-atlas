import { Address, Chain, createPublicClient, Hash, http } from "viem"
import { Chain as ViemChain } from "viem/chains"
import { atlasSupportedChains } from "./utils/contracts"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is missing from env")
}

type ChainAttributes = {
  clientUrl: string
}

export type ChainWithAttributes = Chain & Partial<ChainAttributes>

type AtlasSupportedChains = typeof atlasSupportedChains

type StrictClientUrls = {
  [K in keyof AtlasSupportedChains as AtlasSupportedChains[K]["id"]]: ChainAttributes
}

export const CLIENT_URLS: Record<number, ChainAttributes> = {
  [atlasSupportedChains.arenaZ.id]: { clientUrl: "https://rpc.arena-z.gg" },
  [atlasSupportedChains.base.id]: {
    clientUrl: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [atlasSupportedChains.bob.id]: { clientUrl: "https://rpc.gobob.xyz" },
  [atlasSupportedChains.ethernity.id]: {
    clientUrl: "https://mainnet.ethernitychain.io",
  },
  [atlasSupportedChains.ink.id]: {
    clientUrl: `https://ink-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [atlasSupportedChains.lisk.id]: { clientUrl: "https://rpc.api.lisk.com" },
  [atlasSupportedChains.metalL2.id]: { clientUrl: "https://rpc.metall2.com" },
  [atlasSupportedChains.mint.id]: { clientUrl: "https://rpc.mintchain.io" },
  [atlasSupportedChains.mode.id]: { clientUrl: "https://mainnet.mode.network" },
  [atlasSupportedChains.optimism.id]: {
    clientUrl: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [atlasSupportedChains.polynomial.id]: {
    clientUrl: "https://rpc.polynomial.fi",
  },
  [atlasSupportedChains.race.id]: { clientUrl: "https://racemainnet.io" },
  [atlasSupportedChains.shape.id]: {
    clientUrl: `https://shape-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [atlasSupportedChains.soneium.id]: { clientUrl: "https://rpc.soneium.org" },
  [atlasSupportedChains.superseed.id]: {
    clientUrl: "https://mainnet.superseed.xyz",
  },
  [atlasSupportedChains.swell.id]: {
    clientUrl: "https://swell-mainnet.alt.technology",
  },
  [atlasSupportedChains.unichain.id]: {
    clientUrl: "https://mainnet.unichain.org",
  },
  [atlasSupportedChains.worldchain.id]: {
    clientUrl: `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [atlasSupportedChains.zora.id]: { clientUrl: "https://rpc.zora.energy" },
} as const satisfies StrictClientUrls

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

export const clients = Object.fromEntries(
  Object.values(atlasSupportedChains).map((chain) => [
    chain.id,
    createClient(chain, CLIENT_URLS[chain.id].clientUrl),
  ]),
)

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
