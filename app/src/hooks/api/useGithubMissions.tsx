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

async function fetchGitHubMissions(): Promise<GitHubMission[]> {
  const response = await fetch('/api/github/missions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
    total: missions.length
  }

  missions.forEach(mission => {
    const columnName = mission.column?.toLowerCase() || ''
    if (columnName.includes('done')) {
      counts.done++
    } else if (columnName.includes('in progress')) {
      counts.inProgress++
    } else {
      counts.open++
    }
  })

  return counts
}

export function useGitHubMissions() {
  return useQuery({
    queryKey: ['github-missions'],
    queryFn: fetchGitHubMissions,
    staleTime: 5 * 60 * 1000,
    select: (data: GitHubMission[]) => ({
      missions: data,
      statusCounts: categorizeMissions(data),
      AreMissionsOpen: categorizeMissions(data).open > 0
    })
  })
}