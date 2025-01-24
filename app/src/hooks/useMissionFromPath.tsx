import { getApplicationsForRound } from "@/lib/actions/projects"
import { MODERN_FUNDING_ROUNDS } from "@/lib/mocks"
import { ApplicationWithDetails } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function useMissionFromPath() {
  const pathname = usePathname()

  const segments = pathname?.split("/").filter(Boolean)

  const missionSlug = segments?.[1]

  const mission = MODERN_FUNDING_ROUNDS.find(
    (page) => page.pageName === missionSlug,
  )

  return mission
}
