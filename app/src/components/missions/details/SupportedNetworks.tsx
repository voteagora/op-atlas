import Image from "next/image"
import Link from "next/link"

export interface ChainInfo {
  id: string
  name: string
  logo: string
  website: string
}

export const supportedChains: ChainInfo[] = [
  {
    id: "arenaZ",
    name: "Arena-Z",
    logo: "/assets/chain-logos/arenaZ.png",
    website: "https://www.superchain.eco/chains/arena-z",
  },
  {
    id: "base",
    name: "Base",
    logo: "/assets/chain-logos/base.png",
    website: "https://www.superchain.eco/chains/base",
  },
  {
    id: "bob",
    name: "Bob",
    logo: "/assets/chain-logos/bob.png",
    website: "https://www.superchain.eco/chains/bob",
  },
  {
    id: "epic",
    name: "Epic",
    logo: "/assets/chain-logos/Epic.png",
    website: "https://www.superchain.eco/chains/ethernity",
  },
  {
    id: "ink",
    name: "Ink",
    logo: "/assets/chain-logos/Ink.png",
    website: "https://www.superchain.eco/chains/ink",
  },
  {
    id: "lisk",
    name: "Lisk",
    logo: "/assets/chain-logos/lisk.png",
    website: "https://www.superchain.eco/chains/lisk",
  },
  {
    id: "metalL2",
    name: "Metal L2",
    logo: "/assets/chain-logos/metalL2.png",
    website: "https://www.superchain.eco/chains/metal-l2",
  },
  {
    id: "mint",
    name: "Mint",
    logo: "/assets/chain-logos/mint.png",
    website: "https://www.superchain.eco/chains/mint",
  },
  {
    id: "mode",
    name: "Mode",
    logo: "/assets/chain-logos/mode.png",
    website: "https://www.superchain.eco/chains/mode",
  },
  {
    id: "optimism",
    name: "OP Mainnet",
    logo: "/assets/chain-logos/OP-Mainnet.png",
    website: "https://www.superchain.eco/chains/op-mainnet",
  },
  {
    id: "polynomial",
    name: "Polynomial",
    logo: "/assets/chain-logos/polynomial.png",
    website: "https://www.superchain.eco/chains/polynomial",
  },
  {
    id: "race",
    name: "RACE",
    logo: "/assets/chain-logos/race.jpeg",
    website: "https://www.superchain.eco/chains/race",
  },
  {
    id: "shape",
    name: "Shape",
    logo: "/assets/chain-logos/shape.png",
    website: "https://www.superchain.eco/chains/shape",
  },
  {
    id: "soneium",
    name: "soneium",
    logo: "/assets/chain-logos/Soneium.png",
    website: "https://www.superchain.eco/chains/soneium",
  },
  {
    id: "superseed",
    name: "Superseed",
    logo: "/assets/chain-logos/superseed.jpg",
    website: "https://www.superchain.eco/chains/superseed",
  },
  {
    id: "swell",
    name: "Swell",
    logo: "/assets/chain-logos/Swell.png",
    website: "https://www.superchain.eco/chains/swell",
  },
  {
    id: "unichain",
    name: "Unichain",
    logo: "/assets/chain-logos/Unichain.png",
    website: "https://www.superchain.eco/chains/unichain",
  },
  {
    id: "worldchain",
    name: "World",
    logo: "/assets/chain-logos/worldchain.png",
    website: "https://www.superchain.eco/chains/world-chain",
  },
  {
    id: "zora",
    name: "Zora",
    logo: "/assets/chain-logos/zora.png",
    website: "https://www.superchain.eco/chains/zora",
  },
]

export function SupportedNetworks() {
  return (
    <div className="bg-secondary/20 rounded-xl">
      <h3 className="text-xl font-normal mb-6">Supported chains</h3>
      <div className="flex flex-wrap gap-y-2 gap-x-1.5">
        {supportedChains.map((chain) => (
          <Link
            key={chain.id}
            href={chain.website}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-2.5 pr-3 py-2 bg-backgroundSecondary rounded-full inline-flex justify-start items-center gap-2 hover:bg-backgroundSecondary/90 transition-colors"
          >
            <Image
              src={chain.logo}
              alt={chain.name}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover"
            />
            <div className="justify-start text-foreground text-sm font-normal leading-[20px]">
              {chain.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 inline-flex items-center gap-2">
        <span className="text-secondary-foreground">
          Please confirm your chain&apos;s eligibility status{" "}
          <Link
            href="https://www.superchain.eco/chains"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            here
          </Link>
          .
        </span>
      </div>
    </div>
  )
}
