import { getCitizenForUser } from "@/db/citizens"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export const USER_CITIZEN_QUERY_KEY = "citizen"

export const useUserCitizen = () => {
  const { data: session } = useSession()
  if (!session?.user?.id) {
    return { citizen: null, isLoading: false, isSuccess: false, isError: false }
  }

  const {
    data: citizen,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [USER_CITIZEN_QUERY_KEY, session.user.id],
    queryFn: async () => {
      return await getCitizenForUser(session.user.id)
    },
    enabled: !!session?.user?.id,
  })

  return { citizen, isLoading, isSuccess, isError }
}
