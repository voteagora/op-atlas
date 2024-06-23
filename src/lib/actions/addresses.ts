"use server"

import { verifyMessage } from "viem"

import { auth } from "@/auth"
import {
  addUserAddresses,
  getUserAddresses,
  removeUserAddress,
} from "@/db/users"

import { getUserConnectedAddresses } from "../neynar"

const getMessage = (address: string) => `${address}`

export const verifyUserAddress = async (
  address: `0x${string}`,
  signature: `0x${string}`,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const user = await getUserAddresses(session.user.id)
  if (!user) {
    return {
      error: "Unauthorized",
    }
  }

  if (user.addresses.some(({ address: existing }) => existing === address)) {
    return {
      error: "Address already verified",
    }
  }

  // Verify signature
  const isValidSignature = await verifyMessage({
    address,
    message: getMessage(address),
    signature: signature as `0x${string}`,
  })

  if (!isValidSignature) {
    return {
      error: "Invalid signature",
    }
  }

  await addUserAddresses({
    id: user.id,
    addresses: [address],
    source: "atlas",
  })

  const updated = await getUserAddresses(user.id)
  return {
    error: null,
    user: updated,
  }
}

export const deleteUserAddress = async (address: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  await removeUserAddress({
    id: session.user.id,
    address,
  })

  const updated = await getUserAddresses(session.user.id)
  return {
    error: null,
    user: updated,
  }
}

export const syncFarcasterAddresses = async () => {
  const session = await auth()

  if (!session?.user?.id || !session.user.farcasterId) {
    return {
      error: "Unauthorized",
    }
  }

  const user = await getUserAddresses(session.user.id)
  if (!user) {
    return {
      error: "Unauthorized",
    }
  }

  const farcasterAddresses = await getUserConnectedAddresses(
    session.user.farcasterId,
  )

  // No action needed if the response is empty
  if (!farcasterAddresses || farcasterAddresses.length === 0) {
    return {
      error: null,
      user,
    }
  }

  // Filter out already linked addresses
  const existingAddresses = user.addresses.map(({ address }) => address)
  const newAddresses = farcasterAddresses.filter(
    (address) => !existingAddresses.includes(address),
  )

  await addUserAddresses({
    id: user.id,
    addresses: newAddresses,
    source: "farcaster",
  })

  const updated = await getUserAddresses(user.id)
  return {
    error: null,
    user: updated,
  }
}
