import { useQuery } from "@tanstack/react-query"

import { getUserById } from "@/db/users"
import { UserWithAddresses } from "@/lib/types"

const getUserQualifications = async (candidateUserIds: string[]) => {
  const promises = candidateUserIds.map(async (userId) => {
    return (await getUserById(userId)) as UserWithAddresses
  })

  return Promise.all(promises)
}

export const useMultipleUsers = (candidateUserIds: string[]) => {
  return useQuery({
    queryKey: ["multiple-users", candidateUserIds], // Include the IDs in the query key
    queryFn: async () => {
      return await getUserQualifications(candidateUserIds)
    },
  })
}
