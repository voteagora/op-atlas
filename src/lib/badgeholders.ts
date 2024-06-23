import { Address, checksumAddress } from "viem"

import { UserWithAddresses } from "./types"

// TODO: Replace with final list
export const BADGEHOLDER_ADDRESSES = new Set([
  "0xF0A72469853Db74bEc02301333F29780285b863d", // bwags.eth
  "0xa8DC7990450Cf6A9D40371Ef71B6fa132EeABB0E", // pataguccigirl.eth
])

export function isBadgeholder(user: UserWithAddresses) {
  return user.addresses.some((address) =>
    BADGEHOLDER_ADDRESSES.has(checksumAddress(address.address as Address)),
  )
}
