import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getApplications } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"
import { useEffect, useState } from "react"

export function useUserApplications(): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
} {
  const { data: session } = useSession()

  const [data, setData] = useState<ApplicationWithDetails[] | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function get() {
      setIsLoading(true)
      const result = await getApplications(session?.user?.id!)
      setData(result)
      setIsLoading(false)
    }

    get()
  }, [!!session])

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["userApplications", session?.user?.id],
  //   queryFn: () => getApplications(session?.user?.id!),
  //   enabled: !!session,
  // })

  return { data, isLoading }
}
