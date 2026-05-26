import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { isAddress } from "viem"

import { OrganizationWithDetails, UserWithAddresses } from "./types"

type TeamMemberWithRole = {
  role?: string | null
  user?: {
    id: string
  } | null
}[]

export function useIsAdmin(team: TeamMemberWithRole) {
  const { data: session } = useSession()
  const viewerId =
    session?.impersonation?.isActive && session?.impersonation?.targetUserId
      ? session.impersonation.targetUserId
      : session?.user?.id

  return (
    team &&
    session &&
    team.find(
      (member) => member.user?.id === viewerId && member.role === "admin",
    )
  )
}

export function useIsOrganizationAdmin(organization?: OrganizationWithDetails) {
  const { data: session } = useSession()
  const viewerId =
    session?.impersonation?.isActive && session?.impersonation?.targetUserId
      ? session.impersonation.targetUserId
      : session?.user?.id

  return (
    organization &&
    session &&
    organization.team.find(
      (member) => member.userId === viewerId && member.role === "admin",
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
      const response = await fetch(
        `/api/eas/badgeholder/${encodeURIComponent(address)}`,
        {
          cache: "no-store",
        },
      )

      if (!response.ok) return false

      const data = (await response.json()) as { isBadgeholder?: boolean }

      return Boolean(data.isBadgeholder)
    },
    enabled: Boolean(address),
    initialData: false,
  })

  return { isBadgeholderAddress }
}

export function useIsBadgeholder(user?: Partial<UserWithAddresses>) {
  const addresses = user?.addresses?.map(({ address }) => address) ?? []

  const { data: isBadgeholder } = useQuery({
    queryKey: ["badgeholder-check", addresses],
    queryFn: async () => {
      if (!addresses.length) return false

      const response = await fetch("/api/eas/badgeholder/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses }),
        cache: "no-store",
      })

      if (!response.ok) return false

      const data = (await response.json()) as { isBadgeholder?: boolean }

      return Boolean(data.isBadgeholder)
    },
    enabled: addresses.length > 0,
    initialData: false,
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
