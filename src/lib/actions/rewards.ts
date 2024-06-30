"use server"

import { isAddress } from "viem"

import { getStreams } from "../superfluid"

export const getActiveStream = async (address: string) => {
  if (!isAddress(address)) {
    return {
      error: "Invalid address",
    }
  }

  try {
    const { streams } = await getStreams({ recipient: address.toLowerCase() })
    return {
      error: null,
      stream: streams[0] ?? null,
    }
  } catch (error: unknown) {
    return {
      error: (error as Error).message,
    }
  }
}
