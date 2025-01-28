import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import {
  base,
  fraxtal,
  ink,
  lisk,
  metalL2,
  mode,
  optimism,
  shape,
  superseed,
  swan,
  worldchain,
  zora,
} from "viem/chains"

export enum Chain {
  ArenaZ = arenaZ.id,
  Base = base.id,
  Ethernity = ethernity.id,
  Fraxtal = fraxtal.id,
  Ink = ink.id,
  Lisk = lisk.id,
  MetalL2 = metalL2.id,
  Mode = mode.id,
  Optimism = optimism.id,
  Race = race.id,
  Shape = shape.id,
  Superseed = superseed.id,
  Swan = swan.id,
  Swell = swell.id,
  Worldchain = worldchain.id,
  Zora = zora.id,
}

export const getMessage = (address: string) =>
  `I verify that I'm the owner of ${address} and I'm an optimist.`
