import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUserPassports } from "@/db/users"
import { UserPassport } from "@prisma/client"

export const USER_PASSPORT_QUERY_KEY = "userPassport"

export const useUserPassports = ({
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
        queryKey: [USER_PASSPORT_QUERY_KEY, id],
        queryFn: async () => {
            if (!id) throw new Error("User ID is required")
            return await getUserPassports(id)
        },
        enabled: isEnabled,
    })

    const invalidate = () => {
        if (!id) return Promise.resolve()
        return queryClient.invalidateQueries({ queryKey: [USER_PASSPORT_QUERY_KEY, id] })
    }

    return { data: data as UserPassport[], isLoading, isSuccess, isError, invalidate }
} 