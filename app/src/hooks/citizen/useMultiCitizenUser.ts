import { useQuery } from "@tanstack/react-query"

import { getOrganization } from "@/db/organizations"
import { getUserByUsername } from "@/db/users"

type SimplifiedUserOrOrg = {
  id: string
  name: string
  avatar?: string | null
  link: string
}

const getQualifications = async (
  identifiers: string[],
): Promise<SimplifiedUserOrOrg[]> => {
  const promises = identifiers.map(async (identifier) => {
    const isOrgCitizen = identifier.startsWith("0x")

    if (isOrgCitizen) {
      const org = await getOrganization({ id: identifier })

      return {
        id: identifier,
        name: org?.name,
        avatar: org?.avatarUrl,
        link: `/${identifier}`,
      } as SimplifiedUserOrOrg
    } else {
      // Handle regular usernames
      const user = await getUserByUsername(identifier)
      return {
        id: identifier,
        name: user?.username || identifier,
        avatar: user?.imageUrl,
        link: `/${identifier}`,
      } as SimplifiedUserOrOrg
    }
  })

  return Promise.all(promises)
}

export const useMultipleUsers = (candidateUserIds: string[]) => {
  return useQuery({
    queryKey: ["multiple-users", candidateUserIds], // Include the IDs in the query key
    queryFn: async () => {
      return await getQualifications(candidateUserIds)
    },
  })
}
