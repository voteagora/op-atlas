import { atlasSupportedChains } from "@/lib/utils/contracts"
import { Chain } from "viem"

type ChainAttributes = {
  logo?: string
  name?: string
}

export type ChainWithAttributes = Chain & Partial<ChainAttributes>
export const NETWORKS_EXTRA_DATA: Record<string, ChainAttributes> = {
  [atlasSupportedChains.arenaZ.id]: {
    logo: "/assets/chain-logos/arenaZ.png",
    name: "ArenaZ",
  },
  [atlasSupportedChains.bob.id]: {
    logo: "/assets/chain-logos/bob.png",
    name: "Bob",
  },
  [atlasSupportedChains.base.id]: {
    logo: "/assets/chain-logos/base.png",
    name: "Base",
  },
  [atlasSupportedChains.ethernity.id]: {
    logo: "/assets/chain-logos/ethernity.jpg",
    name: "Ethernity",
  },
  [atlasSupportedChains.ink.id]: {
    logo: "/assets/chain-logos/ink.jpg",
    name: "Ink",
  },
  [atlasSupportedChains.lisk.id]: {
    logo: "/assets/chain-logos/lisk.png",
    name: "Lisk",
  },
  [atlasSupportedChains.metalL2.id]: {
    logo: "/assets/chain-logos/metalL2.png",
    name: "MetalL2",
  },
  [atlasSupportedChains.mint.id]: {
    logo: "/assets/chain-logos/mint.png",
    name: "Mint",
  },
  [atlasSupportedChains.mode.id]: {
    logo: "/assets/chain-logos/mode.png",
    name: "Mode",
  },
  [atlasSupportedChains.optimism.id]: {
    logo: "/assets/chain-logos/optimism.svg",
    name: "OP Mainnet",
  },
  [atlasSupportedChains.polynomial.id]: {
    logo: "/assets/chain-logos/polynomial.png",
    name: "Polynomial",
  },
  [atlasSupportedChains.race.id]: {
    logo: "/assets/chain-logos/race.jpeg",
    name: "Race",
  },
  [atlasSupportedChains.shape.id]: {
    logo: "/assets/chain-logos/shape.png",
    name: "Shape",
  },
  [atlasSupportedChains.soneium.id]: {
    logo: "/assets/chain-logos/soneium.jpg",
    name: "Soneium",
  },
  [atlasSupportedChains.superseed.id]: {
    logo: "/assets/chain-logos/superseed.jpg",
    name: "Superseed",
  },
  [atlasSupportedChains.swell.id]: {
    logo: "/assets/chain-logos/swell.svg",
    name: "Swell",
  },
  [atlasSupportedChains.unichain.id]: {
    logo: "/assets/chain-logos/unichain.jpg",
    name: "Unichain",
  },
  [atlasSupportedChains.worldchain.id]: {
    logo: "/assets/chain-logos/worldchain.png",
    name: "Worldchain",
  },
  [atlasSupportedChains.zora.id]: {
    logo: "/assets/chain-logos/zora.png",
    name: "Zora",
  },
}

export function getAtlasSupportedNetworksWithAttributes(): Record<
  string,
  ChainWithAttributes
> {
  return Object.fromEntries(
    Object.entries(atlasSupportedChains).map(([key, targetNetwork]) => [
      key,
      {
        ...targetNetwork,
        ...NETWORKS_EXTRA_DATA[targetNetwork.id],
      },
    ]),
  )
}

export function getAtlasSupportedNetworkWithAttributes(
  chainId: number,
): ChainWithAttributes | undefined {
  const chain = Object.values(atlasSupportedChains).find(
    (chain) => chain.id === chainId,
  ) as Chain

  return { ...chain, ...NETWORKS_EXTRA_DATA[chain!.id] }
}
