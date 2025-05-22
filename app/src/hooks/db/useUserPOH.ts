import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUserPOH } from "@/db/users"
import { UserPOH } from "@/lib/types"

export const USER_POH_QUERY_KEY = "userPOH"

export const useUserPOH = ({
    id,
    enabled,
}: {
    id?: string
    enabled?: boolean
}) => {
    const queryClient = useQueryClient()

    // If id is not provided, enabled is always false
    const isEnabled = id ? enabled ?? true : false

    const { data, isLoading, isSuccess, isError } = useQuery({
        queryKey: [USER_POH_QUERY_KEY, id],
        queryFn: async () => {
            if (!id) throw new Error("User ID is required")
            return await getUserPOH(id)
        },
        enabled: isEnabled,
        staleTime: 1000 * 60 * 10, // 10 minutes
    })

    const invalidate = () => {
        if (!id) return Promise.resolve()
        return queryClient.invalidateQueries({ queryKey: [USER_POH_QUERY_KEY, id] })
    }

    return { data: data as UserPOH[], isLoading, isSuccess, isError, invalidate }
} 