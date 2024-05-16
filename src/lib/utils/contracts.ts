import { base, fraxtal, mode, optimism, zora } from "viem/chains"

export enum Chain {
  Base = base.id,
  Fraxtal = fraxtal.id,
  Mode = mode.id,
  Optimism = optimism.id,
  Zora = zora.id,
}

export const getMessage = (address: string) =>
  `I verify that I'm the owner of ${address} and I'm an optimist.`
