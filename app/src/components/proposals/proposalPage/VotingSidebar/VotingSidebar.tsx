"use client"

import { useSession } from "next-auth/react"
import React, { useEffect, useRef, useState } from "react"

// import VotingCard from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VotingCard"
import VotingColumn from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect from "@/components/proposals/proposalPage/VotingSidebar/VotingRedirect"
import { Skeleton } from "@/components/ui/skeleton"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { useUserCitizen } from "@/hooks/citizen/useUserCitizen"
import { ProposalData } from "@/lib/proposals"
import { useAnalytics } from "@/providers/AnalyticsProvider"

interface VotingSidebarProps {
  proposalData: ProposalData
}

const VotingSidebarSkeleton = () => (
  <div className="w-[304px] gap-6 flex flex-col sticky top-4 w-full max-w-[304px]">
    <div className="w-[304px]">
      <div className="flex flex-col p-6 gap-y-4 border rounded-lg">
        <div className="flex flex-col text-center gap-y-2">
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
      <div className="mt-5">
        <Skeleton className="w-[304px] h-10 rounded-md" />
      </div>
    </div>
  </div>
)

const VotingSidebar = ({ proposalData }: VotingSidebarProps) => {
  const { track } = useAnalytics()
  const isTracked = useRef(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { data: citizenEligibility, isLoading: isEligibilityLoading } =
    useCitizenQualification()
  const { citizen, isLoading: isCitizenLoading } = useUserCitizen()
  const { data: session } = useSession()

  useEffect(() => {
    if (!isEligibilityLoading && !isCitizenLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isEligibilityLoading, isCitizenLoading])

  useEffect(() => {
    if (!isTracked.current && !isInitialLoad) {
      // Page View event - when user visits the voting page
      track("Citizen Voting Page View", {
        page_title: "Proposal Voting",
        page_type: proposalData.proposalType,
        proposal_id: proposalData.id,
        citizen_status: citizen
          ? "registered"
          : citizenEligibility?.eligible
          ? "eligible"
          : session?.user?.id
          ? "not signed in"
          : "ineligible",
        user_group: citizenEligibility?.type,
      })
      isTracked.current = true
    }
  }, [
    proposalData,
    track,
    citizen,
    citizenEligibility,
    session?.user?.id,
    isInitialLoad,
  ])

  if (isInitialLoad) {
    return <VotingSidebarSkeleton />
  }

  return (
    <div className="w-[304px] gap-4 flex flex-col sticky top-4 w-full max-w-[304px] transition-all duration-300 ease-in-out animate-in fade-in-0">
      <div className="w-[304px]">
        <div className="transition-all duration-300 ease-in-out">
          <VotingColumn proposalData={proposalData} />
        </div>
        <div className="mt-5 transition-all duration-300 ease-in-out">
          <VotingRedirect proposalData={proposalData} />
        </div>
      </div>
    </div>
  )
}

export default VotingSidebar
