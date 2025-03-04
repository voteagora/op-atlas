import Image from "next/image"
import { getAtlasSupportedNetworksWithAttributes } from "./chain"

export function ChainLogo({
  className,
  chainId,
  size = 24,
}: {
  className?: string
  chainId: string
  size?: number
}) {
  const chainInfo = Object.values(
    getAtlasSupportedNetworksWithAttributes(),
  ).find((chain) => chain.id.toString() === chainId)

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
