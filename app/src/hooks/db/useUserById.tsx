import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { UserWithAddresses } from "@/lib/types"
import { getUserById } from "@/db/users"

export function useUserById(): {
  data: UserWithAddresses | undefined | null
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", session?.data?.user?.id],
    queryFn: () => getUserById(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
  })

  return { data, isLoading, error }
}
