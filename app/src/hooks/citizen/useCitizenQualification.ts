import { useQuery } from "@tanstack/react-query"

import { s8CitizenshipQualification } from "@/lib/actions/citizens"
import { CitizenshipQualification } from "@/lib/types"

export const useCitizenQualification = () => {
  return useQuery({
    queryKey: ["citizen-qualification"],
    queryFn: async () => {
      return (await s8CitizenshipQualification()) as CitizenshipQualification
    },
  })
}
