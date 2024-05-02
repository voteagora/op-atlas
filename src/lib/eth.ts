import { createPublicClient, http } from "viem"
import { base, fraxtal, mainnet, mode, optimism, zora } from "viem/chains"

import { Chain } from "./contractUtils"

const clients = {
  [Chain.Eth]: createPublicClient({ chain: mainnet, transport: http() }),
  [Chain.Base]: createPublicClient({ chain: base, transport: http() }),
  [Chain.Fraxtal]: createPublicClient({ chain: fraxtal, transport: http() }),
  [Chain.Mode]: createPublicClient({ chain: mode, transport: http() }),
  [Chain.Optimism]: createPublicClient({ chain: optimism, transport: http() }),
  [Chain.Zora]: createPublicClient({ chain: zora, transport: http() }),
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
