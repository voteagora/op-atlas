import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

import { updateEmail } from "./actions/users"
import { ProjectWithDetails } from "./types"

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
