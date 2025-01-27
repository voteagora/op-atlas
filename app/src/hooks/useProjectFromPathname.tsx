import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useProject } from "./db/useProject"

export function useProjectFromPathname() {
  const pathname = usePathname()
  const segments = pathname?.split("/").filter(Boolean)
  const slug = segments?.[1]

  return useProject(slug)
}
