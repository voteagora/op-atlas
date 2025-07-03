import { useQuery } from "@tanstack/react-query"

import { getUserById } from "@/db/users"
import { s8CitizenshipQualification } from "@/lib/actions/citizens"
import { UserWithAddresses } from "@/lib/types"

const getUserQualifications = async (candidateUserIds: string[]) => {
  const promises = candidateUserIds.map(async (userId) => {
    const user = (await getUserById(userId)) as UserWithAddresses
    const qualification = await s8CitizenshipQualification({
      userId,
    })
    return {
      user,
      qualification,
    }
  })

  return Promise.all(promises)
}

export const useMultipleUserQualifications = (candidateUserIds: string[]) => {
  return useQuery({
    queryKey: ["citizen-qualifications", candidateUserIds], // Include the IDs in the query key
    queryFn: async () => {
      return await getUserQualifications(candidateUserIds)
    },
  })
}
