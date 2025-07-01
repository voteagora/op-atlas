import { useQuery } from "@tanstack/react-query"

import { s8CitizenshipQualification } from "@/lib/actions/citizens"
import { CitizenshipQualification } from "@/lib/types"

interface UseCitizenQualificationOptions {
  userId?: string
}

export const useCitizenQualification = (
  options: UseCitizenQualificationOptions = {},
) => {
  const { userId } = options

  return useQuery({
    queryKey: ["citizen-qualification", userId],
    queryFn: async () => {
      return (await s8CitizenshipQualification({
        userId,
      })) as CitizenshipQualification
    },
  })
}
