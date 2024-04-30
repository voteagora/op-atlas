import { useSession } from "next-auth/react"

import { ProjectWithDetails } from "./types"

export function useIsAdmin(project?: ProjectWithDetails) {
  const { data: session } = useSession()

  return (
    project &&
    session &&
    project.team.find(
      (member) =>
        member.userId === session.user.id &&
        (member.role === "owner" || member.role === "admin"),
    )
  )
}
