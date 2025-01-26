import { getUserById } from "@/db/users"
import { UserWithAddresses } from "@/lib/types"
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export function useUserById(
  queryOptions?: Partial<UseQueryOptions<UserWithAddresses | null, Error>>,
): UseQueryResult<UserWithAddresses | null, Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["user", session?.data?.user?.id],
    queryFn: () => getUserById(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
    ...queryOptions, // Spread custom options here
  })
}
