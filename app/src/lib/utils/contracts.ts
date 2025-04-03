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
  unichain,
  worldchain,
  zora,
} from "viem/chains"

export const polynomial = {
  id: 8008,
} as Chain

export const atlasSupportedChains = {
  arenaZ,
  ethernity,
  race,
  swell,
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
  unichain,
  worldchain,
  zora,
  polynomial,
}

export function truncate(value: string, numToShow: number) {
  return `${value.slice(0, numToShow)}${
    numToShow < value.length / 2 ? "..." : ""
  }${value.slice(-numToShow)}`
}

export const getMessage = (projectId: string) =>
  `I verify that my contracts are for Project ${projectId} and I'm an optimist.`
