import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

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
export default function usePrevious<T>(value: T) {
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
