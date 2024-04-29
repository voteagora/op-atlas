import Image from "next/image"
import { CHAIN_INFO } from "./chain"

export function ChainLogo({
  chainId,
  size = 24,
}: {
  chainId: string
  size?: number
}) {
  const chainInfo = CHAIN_INFO[chainId]
  if (!chainInfo) throw new Error(`chain info not found for chainId ${chainId}`)
  return (
    <Image
      src={CHAIN_INFO[chainId]?.logo}
      height={size}
      width={size}
      alt={``}
    />
  )
}
