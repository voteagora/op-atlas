import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import {
  base,
  bob,
  Chain,
  ink,
  lisk,
  metalL2,
  mint,
  mode,
  optimism,
  shape,
  soneium,
  superseed,
  worldchain,
  zora,
} from "viem/chains"

export const polynomial = {
  id: 8008,
} as Chain

export const CHAIN_INFO: { [chainId: string]: { logo: string; name: string } } =
  {
    [arenaZ.id.toString()]: {
      logo: "/assets/chain-logos/arenaZ.png",
      name: "ArenaZ",
    },
    [bob.id.toString()]: {
      logo: "/assets/chain-logos/bob.png",
      name: "Bob",
    },
    [base.id.toString()]: {
      logo: "/assets/chain-logos/base.png",
      name: "Base",
    },
    [ethernity.id.toString()]: {
      logo: "/assets/chain-logos/ethernity.jpg",
      name: "Ethernity",
    },
    [ink.id.toString()]: {
      logo: "/assets/chain-logos/ink.jpg",
      name: "Ink",
    },
    [lisk.id.toString()]: {
      logo: "/assets/chain-logos/lisk.png",
      name: "Lisk",
    },
    [metalL2.id.toString()]: {
      logo: "/assets/chain-logos/metalL2.png",
      name: "MetalL2",
    },
    [mint.id.toString()]: {
      logo: "/assets/chain-logos/mint.png",
      name: "Mint",
    },
    [mode.id.toString()]: {
      logo: "/assets/chain-logos/mode.png",
      name: "Mode",
    },
    [optimism.id.toString()]: {
      logo: "/assets/chain-logos/optimism.svg",
      name: "OP Mainnet",
    },
    [polynomial.id.toString()]: {
      logo: "/assets/chain-logos/polynomial.png",
      name: "Polynomial",
    },
    [race.id.toString()]: {
      logo: "/assets/chain-logos/race.jpeg",
      name: "Race",
    },
    [shape.id.toString()]: {
      logo: "/assets/chain-logos/shape.png",
      name: "Shape",
    },
    [soneium.id.toString()]: {
      logo: "/assets/chain-logos/soneium.jpg",
      name: "Soneium",
    },
    [superseed.id.toString()]: {
      logo: "/assets/chain-logos/superseed.jpg",
      name: "Superseed",
    },
    [swell.id.toString()]: {
      logo: "/assets/chain-logos/swell.svg",
      name: "Swell",
    },
    [worldchain.id.toString()]: {
      logo: "/assets/chain-logos/worldchain.png",
      name: "Worldchain",
    },
    [zora.id.toString()]: {
      logo: "/assets/chain-logos/zora.png",
      name: "Zora",
    },
  }
