import Image from "next/image"

import { CHAIN_INFO } from "./chain"

export function ChainLogo({
  className,
  chainId,
  size = 24,
}: {
  className?: string
  chainId: string
  size?: number
}) {
  const chainInfo = CHAIN_INFO[chainId]
  if (!chainInfo) return null

  return (
    <Image
      src={chainInfo.logo}
      height={size}
      width={size}
      alt={`${chainInfo.name} logo`}
      className={className}
    />
  )
}
