import { createPublicClient, http } from "viem"
import { base, fraxtal, mainnet, mode, optimism, zora } from "viem/chains"

import { Chain } from "./utils/contracts"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is missing from env")
}

const clients = {
  [Chain.Eth]: createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  }),
  [Chain.Base]: createPublicClient({
    chain: base,
    transport: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  }),
  [Chain.Fraxtal]: createPublicClient({
    chain: fraxtal,
    transport: http("https://rpc.frax.com"),
  }),
  [Chain.Mode]: createPublicClient({
    chain: mode,
    transport: http("https://mainnet.mode.network"),
  }),
  [Chain.Optimism]: createPublicClient({
    chain: optimism,
    transport: http(`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  }),
  [Chain.Zora]: createPublicClient({
    chain: zora,
    transport: http("https://rpc.zora.energy"),
  }),
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
