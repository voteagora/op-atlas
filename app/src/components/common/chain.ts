import {
  base,
  fraxtal,
  lisk,
  metalL2,
  mode,
  optimism,
  shape,
  superseed,
  swan,
  worldchain,
  zora,
  ink,
} from "viem/chains"

export const CHAIN_INFO: { [chainId: string]: { logo: string; name: string } } =
  {
    [base.id.toString()]: {
      logo: "/assets/chain-logos/base.png",
      name: "Base",
    },
    [fraxtal.id.toString()]: {
      logo: "/assets/chain-logos/fraxtal.png",
      name: "Fraxtal",
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
    [mode.id.toString()]: {
      logo: "/assets/chain-logos/mode.png",
      name: "Mode",
    },
    [optimism.id.toString()]: {
      logo: "/assets/chain-logos/optimism.png",
      name: "OP Mainnet",
    },
    [shape.id.toString()]: {
      logo: "/assets/chain-logos/shape.png",
      name: "Shape",
    },
    [superseed.id.toString()]: {
      logo: "/assets/chain-logos/superseed.jpg",
      name: "Superseed",
    },
    [swan.id.toString()]: {
      logo: "/assets/chain-logos/swan.png",
      name: "Swan",
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
