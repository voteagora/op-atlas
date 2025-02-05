import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  getAdminProjects,
  getApplicationsForRound,
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

export function useAdminProjects(): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
} {
  const { data: session } = useSession()

  const [data, setData] = useState<ProjectWithDetails[] | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function get() {
      setIsLoading(true)
      const result = await getAdminProjects(session?.user?.id!)
      setData(result)
      setIsLoading(false)
    }

    get()
  }, [!!session])
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["adminProjects", session?.user.id],
  //   queryFn: () => getAdminProjects(session?.user.id as string),
  //   enabled: !!session,
  // })

  return { data, isLoading }
}
