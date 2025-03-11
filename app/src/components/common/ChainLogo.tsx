import Image from "next/image"
import { getAtlasSupportedNetworkWithAttributes } from "./chain"

export function ChainLogo({
  className,
  chainId,
  size = 24,
}: {
  className?: string
  chainId: number
  size?: number
}) {
  const chainInfo = getAtlasSupportedNetworkWithAttributes(chainId)

  if (!chainInfo) return null

  return (
    <Image
      src={chainInfo.logo || ""}
      height={size}
      width={size}
      alt={`${chainInfo.name} logo`}
      className={className}
    />
  )
}
