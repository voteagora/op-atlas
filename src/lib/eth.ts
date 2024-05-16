import { Address, createPublicClient, Hash, http } from "viem"
import {
  base,
  Chain as ViemChain,
  fraxtal,
  mode,
  optimism,
  zora,
} from "viem/chains"

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
  [Chain.Base]: createClient(
    base,
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  ),
  [Chain.Fraxtal]: createClient(fraxtal, "https://rpc.frax.com"),
  [Chain.Mode]: createClient(mode, "https://mainnet.mode.network"),
  [Chain.Optimism]: createClient(
    optimism,
    `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
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
