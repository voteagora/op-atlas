import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { getApplicationsForRound } from "@/lib/actions/projects"
import { MISSIONS } from "@/lib/MissionsAndRoundData"
import { ApplicationWithDetails } from "@/lib/types"

export function useMissionFromPath() {
  const pathname = usePathname()

  const segments = pathname?.split("/").filter(Boolean)

  const missionSlug = segments?.[1]

  const mission = MISSIONS.find((page) => page.pageName === missionSlug)

  return mission
}
