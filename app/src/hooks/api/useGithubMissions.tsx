"use client"

import { useQuery } from "@tanstack/react-query"

export interface GitHubMission {
  id: number
  title: string
  state: "open" | "closed"
  column?: string
  labels: Array<{
    name: string
    color: string
  }>
  assignees: Array<{
    login: string
  }>
  created_at: string
  updated_at: string
}

export interface MissionStatusCounts {
  open: number
  inProgress: number
  done: number
  total: number
}

interface UseGitHubMissionsOptions {
  enabled?: boolean
}

async function fetchGitHubMissions(): Promise<GitHubMission[]> {
  const response = await fetch("/api/github/missions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub missions: ${response.statusText}`)
  }

  return response.json()
}

function categorizeMissions(missions: GitHubMission[]): MissionStatusCounts {
  const counts = {
    open: 0,
    inProgress: 0,
    done: 0,
    total: missions.length,
  }

  missions.forEach((mission) => {
    const columnName = mission.column?.toLowerCase() || ""
    if (columnName.includes("done")) {
      counts.done++
    } else if (columnName.includes("in progress")) {
      counts.inProgress++
    } else {
      counts.open++
    }
  })

  return counts
}

export function useGitHubMissions(options: UseGitHubMissionsOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ["github-missions"],
    queryFn: fetchGitHubMissions,
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    select: (data: GitHubMission[]) => {
      const statusCounts = categorizeMissions(data)

      return {
        missions: data,
        statusCounts,
        AreMissionsOpen: statusCounts.open > 0,
      }
    },
  })
}
