import { createPublicClient, http } from "viem"
import { optimism } from "viem/chains"

export default async function verifyMessage({
  address,
  message,
  signature,
}: {
  address: `0x${string}`
  signature: `0x${string}`
  message: string
}) {
  const alchemyId = process.env.ALCHEMY_API_KEY!

  const transport = `https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`

  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(transport),
  })

  return await publicClient.verifyMessage({
    address,
    message,
    signature,
  })
}
