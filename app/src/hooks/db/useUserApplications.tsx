import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getApplications } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useUserApplications(): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["userApplications"],
    queryFn: () => getApplications(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
  })

  return { data, isLoading, error }
}
