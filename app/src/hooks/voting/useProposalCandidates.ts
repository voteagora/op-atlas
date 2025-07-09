import { useQuery } from "@tanstack/react-query"

import { getOrganization } from "@/db/organizations"
import { getUserByUsername } from "@/db/users"

type ProposalCandidate = {
  id: string
  name: string
  avatar?: string | null
  link: string
}

const getQualifications = async (
  identifiers: string[],
): Promise<ProposalCandidate[]> => {
  const promises = identifiers.map(async (identifier) => {
    const isOrgCitizen = identifier.startsWith("0x")

    if (isOrgCitizen) {
      const org = await getOrganization({ id: identifier })

      return {
        id: identifier,
        name: org?.name,
        avatar: org?.avatarUrl,
        link: `/${identifier}`,
      } as ProposalCandidate
    } else {
      // Handle regular usernames
      const user = await getUserByUsername(identifier)
      return {
        id: identifier,
        name: user?.username || identifier,
        avatar: user?.imageUrl,
        link: `/${identifier}`,
      } as ProposalCandidate
    }
  })

  return Promise.all(promises)
}

export const useProposalCandidates = (candidateUserIds: string[]) => {
  return useQuery({
    queryKey: ["proposal-candidates", candidateUserIds],
    queryFn: async () => {
      return await getQualifications(candidateUserIds)
    },
  })
}
