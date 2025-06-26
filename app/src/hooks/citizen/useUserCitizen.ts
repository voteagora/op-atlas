import { getCitizenForUser } from "@/db/citizens"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export const USER_CITIZEN_QUERY_KEY = "citizen"

export const useUserCitizen = () => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      queryClient.invalidateQueries({
        queryKey: [USER_CITIZEN_QUERY_KEY, session.user.id],
      })
    }
  }, [session?.user?.id, queryClient])

  const {
    data: citizen,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [USER_CITIZEN_QUERY_KEY, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return null
      } else {
        return await getCitizenForUser(session.user.id)
      }
    },
    enabled: !!session?.user?.id,
  })

  return { citizen, isLoading, isSuccess, isError }
}
