import { User } from "@prisma/client"
import { useMemo } from "react"
import { getAddress, isAddress } from "viem"

import { useEnsName } from "./useEnsName"

/**
 * Returns a display name for a user based on the following priority:
 * 1. Explicit username if set
 * 2. ENS name if available, otherwise truncated Ethereum address
 * 3. Email local part (before @) truncated to 20 characters if needed
 * 4. null if no suitable display name can be determined
 */
export const useUsername = (
  user?: User & {
    emails?: { email: string }[]
    addresses?: { address: string; primary?: boolean }[]
  },
) => {
  const primaryOrFirstAddress =
    user?.addresses?.find((a) => a.primary)?.address ?? user?.addresses?.[0]?.address

  const validAddress =
    primaryOrFirstAddress && isAddress(primaryOrFirstAddress)
      ? (getAddress(primaryOrFirstAddress) as `0x${string}`)
      : undefined
  const { data: ensName } = useEnsName(validAddress)

  const username = useMemo<string | null>(() => {
    if (!user) return null
    if (user.name) return user.name
    if (validAddress) {
      return ensName ?? `0x${validAddress.slice(2, 5)}...${validAddress.slice(-3)}`
    }

    if (user.username) {
      return user.username
    }

    return null
  }, [user, ensName, validAddress])

  return username
}
