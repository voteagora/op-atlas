"use client"

import React, { useState, useRef, useEffect } from "react"

import {
  VotingCardProps,
  VotingColumnProps,
  VotingRedirectProps,
} from "@/components/proposals/proposal.types"
import VotingCard from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VotingCard"
import VotingColumn from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect from "@/components/proposals/proposalPage/VotingSidebar/VotingRedirect"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { useUserCitizen } from "@/hooks/citizen/useUserCitizen"

interface VotingSidebarProps {
  votingCardProps: VotingCardProps
  votingColumnProps: VotingColumnProps
  votingRedirectProps?: VotingRedirectProps
}

const VotingSidebar = ({
  votingCardProps,
  votingColumnProps,
  votingRedirectProps,
}: VotingSidebarProps) => {
  const { track } = useAnalytics()
  const isTracked = useRef(false)

  const { data: citizenEligibility } = useCitizenQualification()
  const { citizen } = useUserCitizen()

  useEffect(() => {
    if (!isTracked.current) {
      // Page View event - when user visits the voting page
      track("Citizen Voting Page View", {
        page_title: "Proposal Voting",
        page_type: votingColumnProps.proposalType,
        proposal_id: votingColumnProps.proposalId,
        citizen_status: citizen
          ? "registered"
          : citizenEligibility?.eligible
          ? "eligible"
          : "ineligible",
      })
      isTracked.current = true
    }
  }, [votingColumnProps, track, citizen, citizenEligibility])

  return (
    <div className="w-[304px] gap-6 flex flex-col sticky top-4 w-full max-w-[304px]">
      <div className="w-[304px] ">
        <VotingCard {...votingCardProps} />
        <VotingColumn {...votingColumnProps} />
        <div className="mt-5">
          {votingRedirectProps && <VotingRedirect {...votingRedirectProps} />}
        </div>
      </div>
    </div>
  )
}

export default VotingSidebar
