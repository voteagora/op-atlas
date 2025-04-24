import { getUserById } from "@/db/users"
import { UserWithAddresses } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export const useUser = ({ id, enabled }: { id: string, enabled: boolean }) => {

    const { data, isLoading, isSuccess, isError } = useQuery({
        queryKey: ["user", id],
        queryFn: async () => await getUserById(id) as UserWithAddresses,
        enabled,
        staleTime: 1000 * 60 * 5,
    })

    return { user: data, isLoading, isSuccess, isError }
}

