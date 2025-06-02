import { useQuery } from "@tanstack/react-query"

import { s8CitizenshipQualification } from "@/lib/actions/citizens"

export const useCitizenQualifications = () => {
  return useQuery({
    queryKey: ["citizen-qualification"],
    queryFn: async () => {
      return await s8CitizenshipQualification()
    },
  })
}
