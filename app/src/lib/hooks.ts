import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { isAddress } from "viem"

import { getAllBadgeholders, getBadgeholder } from "./api/eas/badgeholder"
import {
  OrganizationWithDetails,
  ProjectTeam,
  UserWithAddresses,
} from "./types"

export function useIsAdmin(team: ProjectTeam) {
  const { data: session } = useSession()

  return (
    team &&
    session &&
    team.find(
      (member) => member.user.id === session.user.id && member.role === "admin",
    )
  )
}

export function useIsOrganizationAdmin(organization?: OrganizationWithDetails) {
  const { data: session } = useSession()

  return (
    organization &&
    session &&
    organization.team.find(
      (member) => member.userId === session.user.id && member.role === "admin",
    )
  )
}

// modified from https://usehooks.com/usePrevious/
export function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>()

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}

export function useBadgeholderAddress(address: string) {
  const { data: isBadgeholderAddress } = useQuery({
    queryKey: ["badgeholder", address],
    queryFn: async () => {
      if (!isAddress(address)) return false
      return Boolean(await getBadgeholder(address))
    },
    enabled: Boolean(address),
  })

  return { isBadgeholderAddress }
}

export function useIsBadgeholder(user?: Partial<UserWithAddresses>) {
  const { data: isBadgeholder } = useQuery({
    queryKey: ["badgeholders", user],
    queryFn: async () => {
      if (!user?.addresses?.length) return false

      const allBadgeholders = await getAllBadgeholders()
      const allBadgeholderAddresses = new Set(
        allBadgeholders.map((badgeholder) => badgeholder.address),
      )

      return user.addresses.some((address) =>
        allBadgeholderAddresses.has(address.address),
      )
    },
    enabled: Boolean(user?.addresses?.length),
  })

  return { isBadgeholder }
}

type AlertKey =
  | "defillama-adapter"
  | "deployed-on-worldchain"
  | "bundle-bear-contract"
  | "increase-your-impact"
  | "op-reward-threshold"

const alertKeyMap: Record<AlertKey, string> = {
  "defillama-adapter": "defillamaAdapter",
  "deployed-on-worldchain": "worldchainAlert",
  "bundle-bear-contract": "bundleBearAlert",
  "increase-your-impact": "increaseYourImpact",
  "op-reward-threshold": "opRewardThreshold",
}

type HiddenAlertsState = Record<string, boolean>

export function useHiddenAlerts(alertKeys: AlertKey[]) {
  const initialState = alertKeys.reduce<HiddenAlertsState>((acc, key) => {
    const stateKey = alertKeyMap[key]
    acc[stateKey] = localStorage.getItem(key) === "true"
    return acc
  }, {})

  const [hiddenAlerts, setHiddenAlerts] = useState(initialState)

  const hideAlert = (storageKey: AlertKey) => {
    localStorage.setItem(storageKey, "true")
    const stateKey = alertKeyMap[storageKey]
    setHiddenAlerts((prev) => ({ ...prev, [stateKey]: true }))
  }

  return {
    hiddenAlerts,
    hideAlert,
  }
}
