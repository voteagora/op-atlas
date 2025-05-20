import { useQuery } from "@tanstack/react-query"
import { PassportScore } from "@/lib/types"

const fetchPassportScore = async (address: string): Promise<PassportScore> => {
    const response = await fetch(`/api/passport?address=${address}`)
    if (!response.ok) {
        throw new Error("Failed to fetch Passport score")
    }
    return response.json()
}

export const PASSPORT_SCORE_QUERY_KEY = "passport-score"

export const usePassportScore = ({
    address,
    enabled,
}: {
    address?: string
    enabled?: boolean
}) => {
    // If address is not provided, enabled is always false
    const isEnabled = address ? enabled ?? true : false

    const { data, isLoading, isSuccess, isError } = useQuery({
        queryKey: [PASSPORT_SCORE_QUERY_KEY, address],
        queryFn: async () => {
            if (!address) throw new Error("Address is required")
            return fetchPassportScore(address)
        },
        enabled: isEnabled,
    })

    return { data, isLoading, isSuccess, isError }
} 