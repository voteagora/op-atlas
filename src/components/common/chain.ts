import { base, fraxtal, mode, optimism, zora } from "viem/chains"

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
    [mode.id.toString()]: {
      logo: "/assets/chain-logos/mode.png",
      name: "Mode",
    },
    [optimism.id.toString()]: {
      logo: "/assets/chain-logos/optimism.png",
      name: "Optimism",
    },
    [zora.id.toString()]: {
      logo: "/assets/chain-logos/zora.png",
      name: "Zora",
    },
  }
