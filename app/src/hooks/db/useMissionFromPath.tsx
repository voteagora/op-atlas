import { usePathname } from "next/navigation"

import { MISSIONS } from "@/lib/MissionsAndRoundData"

export function useMissionFromPath() {
  const pathname = usePathname()

  const segments = pathname?.split("/").filter(Boolean)

  const missionSlug = segments?.[1]

  const mission = MISSIONS.find((page) => page.pageName === missionSlug)

  return mission
}
