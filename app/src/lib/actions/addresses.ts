"use server"

import { revalidatePath } from "next/cache"
import { getAddress } from "viem"

import { auth } from "@/auth"
import { addUserAddresses, getUserById, removeUserAddress } from "@/db/users"

import { getUserConnectedAddresses } from "../neynar"
import verifyMessage from "../utils/serverVerifyMessage"

const getMessage = (address: string) =>
  `I verify that I am the owner of ${address} and I'm an optimist.`

export const verifyUserAddress = async (
  address: `0x${string}`,
  signature: `0x${string}`,
) => {
  const checksumAddress = getAddress(address) as `0x${string}`
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

  if (
    user.addresses.some(
      ({ address: existing }) => getAddress(existing) === checksumAddress,
    )
  ) {
    return {
      error: "Address already verified",
    }
  }

  // Verify signature
  const isValidSignature = await verifyMessage({
    address: checksumAddress,
    message: getMessage(checksumAddress),
    signature: signature as `0x${string}`,
  })

  if (!isValidSignature) {
    return {
      error: "Invalid signature",
    }
  }

  await addUserAddresses({
    id: user.id,
    addresses: [checksumAddress],
    source: "atlas",
  })

  const updated = await getUserById(user.id)

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

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
    address: getAddress(address),
  })

  const updated = await getUserById(session.user.id)

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

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

  const farcasterAddresses = await getUserConnectedAddresses(user?.farcasterId)

  // No action needed if the response is empty
  if (!farcasterAddresses || farcasterAddresses.length === 0) {
    return {
      error: null,
      user,
    }
  }

  // Filter out already linked addresses
  const existingAddresses = user.addresses.map(({ address }) =>
    getAddress(address),
  )
  const newAddresses = farcasterAddresses
    .map((addr) => getAddress(addr)) // Checksum farcaster addresses first
    .filter((addr) => !existingAddresses.includes(addr))

  // Process each address individually to avoid collision with existing addresses for the user
  for (const address of newAddresses) {
    try {
      await addUserAddresses({
        id: user.id,
        addresses: [address],
        source: "farcaster",
      })
    } catch (error) {
      console.error(`Failed to add Farcaster address ${address}: ${error}`)
    }
  }

  const updated = await getUserById(user.id)

  revalidatePath("/dashboard")
  revalidatePath("/profile/verified-addresses")

  return {
    error: null,
    user: updated,
  }
}
