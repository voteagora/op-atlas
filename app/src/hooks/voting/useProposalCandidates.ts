import { useQuery } from "@tanstack/react-query"
import mixpanel from "mixpanel-browser"

import { getOrganization } from "@/db/organizations"
import { getUserByUsername } from "@/db/users"

type ProposalCandidate = {
  id: string
  name: string
  avatar?: string | null
  link: string
}

const getQualifications = async (
  identifiers: (string | any)[],
): Promise<ProposalCandidate[]> => {
  return await Promise.all(
    identifiers.map(async (identifier, index) => {
      try {
        // Ensure identifier is a string
        const stringIdentifier =
          typeof identifier === "string"
            ? identifier
            : identifier?.id || identifier?.name || `unknown-${index}`

        // For debugging
        if (typeof identifier !== "string") {
          console.warn(`Non-string identifier at index ${index}:`, identifier)
        }

        const isOrgCitizen =
          typeof stringIdentifier === "string" &&
          stringIdentifier.startsWith("0x")

        if (isOrgCitizen) {
          const org = await getOrganization({ id: stringIdentifier })

          return {
            id: stringIdentifier,
            name: org?.name || stringIdentifier,
            avatar: org?.avatarUrl,
            link: `${process.env.NEXT_PUBLIC_VERCEL_URL}/${stringIdentifier}`,
          } as ProposalCandidate
        } else {
          // Handle regular usernames
          const user = await getUserByUsername(stringIdentifier)
          return {
            id: stringIdentifier,
            name: user?.username || stringIdentifier,
            avatar: user?.imageUrl,
            link: `${process.env.NEXT_PUBLIC_VERCEL_URL}/${stringIdentifier}`,
          } as ProposalCandidate
        }
      } catch (error) {
        // Create a safe string identifier for fallback
        const safeId =
          typeof identifier === "string"
            ? identifier
            : identifier?.id || identifier?.name || `unknown-${index}`

        console.error(`Error fetching candidate ${safeId}:`, error)
        mixpanel.track("Incorrect value passed to getProposalCandidates", {
          candidate_identifier: identifier,
        })
        // Return a fallback candidate with the identifier as the name
        return {
          id: safeId,
          name: safeId,
          link: `${process.env.NEXT_PUBLIC_VERCEL_URL}/${safeId}`,
        } as ProposalCandidate
      }
    }),
  )
}

export const useProposalCandidates = (candidateUserIds: string[]) => {
  return useQuery({
    queryKey: ["proposal-candidates", candidateUserIds],
    queryFn: async () => {
      return await getQualifications(candidateUserIds)
    },
  })
}
