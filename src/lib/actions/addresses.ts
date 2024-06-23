"use server"

import { verifyMessage } from "viem"

import { auth } from "@/auth"
import { addUserAddresses, getUserById, removeUserAddress } from "@/db/users"

import { getUserConnectedAddresses } from "../neynar"

const getMessage = (farcasterId: string) =>
  `I verify that I am ${farcasterId} on Farcaster and I'm an optimist.`

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

  const user = await getUserById(session.user.id)
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
    message: getMessage(user.farcasterId),
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

  const updated = await getUserById(user.id)
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

  const updated = await getUserById(session.user.id)
  return {
    error: null,
    user: updated,
  }
}

export const syncFarcasterAddresses = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const user = await getUserById(session.user.id)
  if (!user) {
    return {
      error: "Unauthorized",
    }
  }

  const farcasterAddresses = await getUserConnectedAddresses(user.farcasterId)

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

  const updated = await getUserById(user.id)
  return {
    error: null,
    user: updated,
  }
}
