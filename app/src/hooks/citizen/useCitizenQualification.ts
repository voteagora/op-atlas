import { useQuery } from "@tanstack/react-query"

import { s8CitizenshipQualification } from "@/lib/actions/citizens"
import { CitizenshipQualification } from "@/lib/types"

export const useCitizenQualification = (userId?: string) => {
  return useQuery({
    queryKey: ["citizen-qualification", userId ?? "anonymous"],
    queryFn: async () => {
      return (await s8CitizenshipQualification(userId!)) as CitizenshipQualification
    },
    enabled: !!userId,
  })
}
