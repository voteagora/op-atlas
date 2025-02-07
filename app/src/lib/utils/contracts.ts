import { arenaZ, ethernity, race, swell } from "@eth-optimism/viem/chains"
import {
  base,
  bob,
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

import { polynomial } from "@/components/common/chain"

export enum Chain {
  ArenaZ = arenaZ.id,
  Base = base.id,
  Bob = bob.id,
  Ethernity = ethernity.id,
  Ink = ink.id,
  Lisk = lisk.id,
  MetalL2 = metalL2.id,
  Mint = mint.id,
  Mode = mode.id,
  Optimism = optimism.id,
  Polynomial = polynomial.id,
  Race = race.id,
  Shape = shape.id,
  Soneium = soneium.id,
  Superseed = superseed.id,
  Swell = swell.id,
  Worldchain = worldchain.id,
  Zora = zora.id,
}

export const getMessage = (address: string) =>
  `I verify that I'm the owner of ${address} and I'm an optimist.`
