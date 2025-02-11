import { Address, getAddress, isAddress } from "viem"

import { getAllBadgeholders, getBadgeholder } from "./api/eas/badgeholder"
import BadgeholderData from "./badgeholders.json"
import { UserWithAddresses } from "./types"

export const BADGEHOLDER_ADDRESSES = new Set(
  BadgeholderData.map(({ address }) => getAddress(address)),
)

export async function isBadgeholderAddress(address: string) {
  if (!isAddress(address)) {
    return false
  }

  return Boolean(await getBadgeholder(address))
}

export async function isBadgeholder(user: UserWithAddresses) {
  const allBadgeholders = await getAllBadgeholders()
  const allBadgeholderAddresses = allBadgeholders.map(
    (badgeholder) => badgeholder.address,
  )

  return user.addresses.some((address) =>
    allBadgeholderAddresses.includes(address.address),
  )
}
