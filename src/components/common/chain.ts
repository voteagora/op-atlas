import { base, fraxtal, liskSepolia, mode, optimism, zora } from "viem/chains"

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
    [liskSepolia.id.toString()]: {
      logo: "/assets/chain-logos/lisk.png",
      name: "Lisk",
    }, // TODO: is there a Lisk mainnet?
    [mode.id.toString()]: {
      logo: "/assets/chain-logos/mode.png",
      name: "Mode",
    },
    [optimism.id.toString()]: {
      logo: "/assets/chain-logos/optimism.png",
      name: "Optimism",
    },
    ["17001"]: { logo: "/assets/chain-logos/redstone.png", name: "Redstone" }, // TODO: which redstone testnet?
    [zora.id.toString()]: {
      logo: "/assets/chain-logos/zora.png",
      name: "Zora",
    },
  }
