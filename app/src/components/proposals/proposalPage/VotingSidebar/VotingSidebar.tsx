"use client"

import React, { useRef, useEffect } from "react"

// import VotingCard from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VotingCard"
import VotingColumn from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect from "@/components/proposals/proposalPage/VotingSidebar/VotingRedirect"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { useUserCitizen } from "@/hooks/citizen/useUserCitizen"
import { ProposalData } from "@/lib/proposals"
import { useSession } from "next-auth/react"

interface VotingSidebarProps {
  proposalData: ProposalData
}

const VotingSidebar = ({ proposalData }: VotingSidebarProps) => {
  const { track } = useAnalytics()
  const isTracked = useRef(false)

  const { data: citizenEligibility } = useCitizenQualification()
  const { citizen } = useUserCitizen()
  const { data: session } = useSession()

  useEffect(() => {
    if (!isTracked.current) {
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
      })
      isTracked.current = true
    }
  }, [proposalData, track, citizen, citizenEligibility])

  return (
    <div className="w-[304px] gap-4 flex flex-col sticky top-4 w-full max-w-[304px]">
      <div className="w-[304px] ">
        <VotingColumn proposalData={proposalData} />
      </div>
      <div className="gap-2">
        <VotingRedirect proposalData={proposalData} />
      </div>
    </div>
  )
}

export default VotingSidebar
