import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { ApplicationWithDetails } from "@/lib/types"

export function useProjectFromPath() {
  const pathname = usePathname()

  const segments = pathname?.split("/").filter(Boolean)

  const missionSlug = segments?.[1]

  return missionSlug
}
