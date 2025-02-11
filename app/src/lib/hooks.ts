import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { isAddress } from "viem"

import { updateEmail } from "./actions/users"
import { getBadgeholder } from "./api/eas/badgeholder"
import { OrganizationWithDetails, ProjectWithDetails } from "./types"

export function useIsAdmin(project?: ProjectWithDetails) {
  const { data: session } = useSession()

  return (
    project &&
    session &&
    project.team.find(
      (member) => member.userId === session.user.id && member.role === "admin",
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

export function useUpdateEmail() {
  const { update } = useSession()

  return useCallback(
    async (newEmail: string) => {
      // update email in db
      await updateEmail(newEmail)
      // update email in session details
      update({ email: newEmail })
    },
    [update],
  )
}

export function useBadgeholderAddress(address: string) {
  const [isBadgeholderAddress, setIsBadgeholderAddress] = useState<
    boolean | null
  >(null)

  useEffect(() => {
    if (!isAddress(address)) {
      setIsBadgeholderAddress(false)
      return
    }

    getBadgeholder(address).then((result) =>
      setIsBadgeholderAddress(Boolean(result)),
    )
  }, [address])

  return { isBadgeholderAddress }
}
