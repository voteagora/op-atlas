import { Address, checksumAddress, getAddress, isAddress } from "viem"

import BadgeholderData from "./badgeholders.json"
import { UserWithAddresses } from "./types"

export const BADGEHOLDER_ADDRESSES = new Set(
  BadgeholderData.map(({ address }) => getAddress(address)),
)

export function isBadgeholderAddress(address: string) {
  if (!isAddress(address)) {
    return false
  }

  return BADGEHOLDER_ADDRESSES.has(getAddress(address))
}

export function isBadgeholder(user: UserWithAddresses) {
  return user.addresses.some((address) =>
    BADGEHOLDER_ADDRESSES.has(checksumAddress(address.address as Address)),
  )
}
