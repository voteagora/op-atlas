import { getUserById } from "@/db/users"
import { UserWithAddresses } from "@/lib/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const USER_QUERY_KEY = "user"

export const useUser = ({ id, enabled }: { id: string, enabled: boolean }) => {

    const queryClient = useQueryClient()

    const { data, isLoading, isSuccess, isError } = useQuery({
        queryKey: [USER_QUERY_KEY, id],
        queryFn: async () => await getUserById(id) as UserWithAddresses,
        enabled,
        staleTime: 1000 * 60 * 10, // 10 minutes
    })

    const invalidate = () => {
        return queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, id] })
    }

    return { user: data, isLoading, isSuccess, isError, invalidate }
}

