"use client"

import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Callout } from "@/components/common/Callout"
import TrackedLink from "@/components/common/TrackedLink"
import { type UserKYCTeam } from "@/lib/types"

interface KYCInProgressCalloutProps {
  kycTeam: UserKYCTeam
}

function KYCInProgressCallout({ kycTeam }: KYCInProgressCalloutProps) {
  const linkPath = kycTeam.projectId
    ? `/projects/${kycTeam.projectId}/grant-address`
    : `/profile/organizations/${kycTeam.organizationId}/grant-address`

  return (
    <Callout
      type="info"
      showIcon={false}
      leftAlignedContent={
        <div className="flex items-center">
          <Image
            alt="Info"
            src={"/assets/icons/info-blue.svg"}
            width={20}
            height={20}
          />
          <div className="ml-2">
            <span className="text-sm font-normal text-blue-800">
              Your grant address is being verified. Rewards can&apos;t be streamed until this is complete.{" "}
            </span>
            <TrackedLink
              className="text-sm font-normal text-blue-800 underline"
              href={linkPath}
              eventName="Link Click"
              eventData={{
                source: "Dashboard",
                linkName: "Check status",
                kycTeamId: kycTeam.id,
                entityType: kycTeam.projectId ? "project" : "organization",
                entityId: kycTeam.projectId || kycTeam.organizationId,
              }}
            >
              Check status
            </TrackedLink>
          </div>
        </div>
      }
    />
  )
}

interface KYCVerifiedCalloutProps {
  kycTeam: UserKYCTeam
  onDismiss: () => void
}

function KYCVerifiedCallout({ kycTeam, onDismiss }: KYCVerifiedCalloutProps) {
  const linkPath = kycTeam.projectId
    ? `/projects/${kycTeam.projectId}/grant-address`
    : `/profile/organizations/${kycTeam.organizationId}/grant-address`

  return (
    <Callout
      type="info"
      showIcon={false}
      leftAlignedContent={
        <div className="flex items-center">
          <Image
            alt="Info"
            src={"/assets/icons/info-blue.svg"}
            width={20}
            height={20}
          />
          <div className="ml-2">
            <span className="text-sm font-normal text-blue-800">
              Your grant address verification is complete.{" "}
            </span>
            <TrackedLink
              className="text-sm font-normal text-blue-800 underline"
              href={linkPath}
              eventName="Link Click"
              eventData={{
                source: "Dashboard",
                linkName: "Check status",
                kycTeamId: kycTeam.id,
                entityType: kycTeam.projectId ? "project" : "organization",
                entityId: kycTeam.projectId || kycTeam.organizationId,
              }}
            >
              Check status
            </TrackedLink>
          </div>
        </div>
      }
      rightAlignedContent={
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={onDismiss}
            className="text-sm font-normal text-blue-800 hover:text-blue-900 cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={onDismiss}
            className="flex items-center justify-center text-blue-800 hover:text-blue-900"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      }
    />
  )
}

interface KYCCalloutsContainerProps {
  kycTeams?: UserKYCTeam[]
}

export function KYCCalloutsContainer({ kycTeams = [] }: KYCCalloutsContainerProps) {
  const [dismissedTeams, setDismissedTeams] = useState<Set<string>>(new Set())
  
  // Initialize dismissed teams from cookies
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const dismissed = new Set<string>()
    const cookies = document.cookie.split(';')
    
    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith('kycVerifiedDismissed_')) {
        const parts = trimmed.split('=')[0].split('_')
        if (parts.length >= 2) {
          const kycTeamId = parts[1]
          dismissed.add(kycTeamId)
        }
      }
    }
    
    setDismissedTeams(dismissed)
  }, [])

  const handleDismiss = useCallback((kycTeamId: string) => {
    // Set cookie with 7-day expiry
    const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
    const timestamp = Date.now()
    document.cookie = `kycVerifiedDismissed_${kycTeamId}_${timestamp}=true; max-age=${maxAge}; path=/`
    
    setDismissedTeams(prev => new Set(prev).add(kycTeamId))
  }, [])

  // Helper function to check if team should be auto-hidden (> 7 days since verification)
  const isAutoHidden = useCallback((kycTeam: UserKYCTeam) => {
    if (kycTeam.status !== "APPROVED") return false
    
    // Find the latest updatedAt from approved users
    const approvedUsers = kycTeam.users.filter(u => u.status === "APPROVED")
    if (approvedUsers.length === 0) return false
    
    const latestUpdate = Math.max(...approvedUsers.map(u => new Date(u.updatedAt).getTime()))
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    return latestUpdate < sevenDaysAgo
  }, [])

  // Filter teams to show
  const inProgressTeams = kycTeams.filter(team => 
    team.status === "PENDING"
  )

  const verifiedTeams = kycTeams.filter(team => 
    team.status === "APPROVED" && 
    !dismissedTeams.has(team.id) && 
    !isAutoHidden(team)
  )

  if (inProgressTeams.length === 0 && verifiedTeams.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 mb-6">
      {inProgressTeams.map(team => (
        <KYCInProgressCallout key={team.id} kycTeam={team} />
      ))}
      {verifiedTeams.map(team => (
        <KYCVerifiedCallout 
          key={team.id} 
          kycTeam={team} 
          onDismiss={() => handleDismiss(team.id)}
        />
      ))}
    </div>
  )
}