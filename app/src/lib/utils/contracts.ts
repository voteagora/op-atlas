import {
  base,
  fraxtal,
  mode,
  optimism,
  zora,
  worldchain,
  lisk,
  metalL2,
  superseed,
  shape,
  swan,
  inkSepolia,
} from "viem/chains"
import { defineChain } from "viem"

export const ink = defineChain({
  id: 57073,
  name: "Ink",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-gel.inkonchain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.inkonchain.com/",
      apiUrl: "https://explorer.inkonchain.com/api/v2",
    },
  },
  sourceId: 1,
})

export enum Chain {
  Base = base.id,
  Fraxtal = fraxtal.id,
  Ink = ink.id,
  Lisk = lisk.id,
  MetalL2 = metalL2.id,
  Mode = mode.id,
  Optimism = optimism.id,
  Shape = shape.id,
  Superseed = superseed.id,
  Swan = swan.id,
  Worldchain = worldchain.id,
  Zora = zora.id,
}

export const getMessage = (address: string) =>
  `I verify that I'm the owner of ${address} and I'm an optimist.`
