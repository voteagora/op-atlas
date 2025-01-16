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
  ink,
} from "viem/chains"

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
