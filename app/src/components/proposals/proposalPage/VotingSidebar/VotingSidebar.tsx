"use client"

import React, { useState,useRef, useEffect } from "react"

import {
  VotingCardProps,
  VotingColumnProps,
  VotingRedirectProps,
} from "@/components/proposals/proposal.types"
import VotingCard from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VotingCard"
import VotingColumn from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect from "@/components/proposals/proposalPage/VotingSidebar/VotingRedirect"
import { useAnalytics } from "@/providers/AnalyticsProvider"

interface VotingSidebarProps {
  className?: string
  votingCardProps: VotingCardProps
  votingColumnProps: VotingColumnProps
  votingRedirectProps?: VotingRedirectProps
  proposalId: string
  citizen?: any
  citizenEligibility?: any
  proposalType?: string
}

const VotingSidebar = ({
  className = "",
  votingCardProps: initialVotingCardProps,
  votingColumnProps,
  votingRedirectProps,
  proposalId,
  citizen,
  citizenEligibility,
  proposalType,
}: VotingSidebarProps) => {
  const [votingCardProps, setVotingCardProps] = useState<VotingCardProps>(
    initialVotingCardProps,
  )
  const { track } = useAnalytics()
  const isTracked = useRef(false)

  // Determine citizen status
  const getCitizenStatus = () => {
    if (citizen) {
      return "registered"
    } else if (citizenEligibility?.eligible) {
      return "eligible"
    } else {
      return "ineligible"
    }
  }

  useEffect(() => {
    if (!isTracked.current) {
      // Page View event - when user visits the voting page
      track("Citizen Voting Page View", {
        page_title: "Proposal Voting",
        page_type: proposalType,
        proposal_id: proposalId,
        citizen_status: getCitizenStatus(),
      })
      isTracked.current = true
    }
  }, [
    proposalId,
    citizen,
    citizenEligibility,
    proposalType,
    track,
  ])

  const updateVotingCardProps = (updatedProps: Partial<VotingCardProps>) => {
    setVotingCardProps((prevProps) => ({
      ...prevProps,
      ...updatedProps,
    }))
  }

  return (
    <div className={`w-[304px] gap-6 flex flex-col ${className}`}>
      <div className="w-[304px] ">
        <VotingCard {...votingCardProps} />
        <VotingColumn
          {...votingColumnProps}
          updateVotingCardProps={updateVotingCardProps}
        />
        <div className="mt-5">
          {votingRedirectProps && <VotingRedirect {...votingRedirectProps} />}
        </div>
      </div>
    </div>
  )
}

export default VotingSidebar
