"use client"

import { useEffect, useRef } from "react"

import { CitizenshipQualification } from "@/lib/types"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export interface CitizenVotingAnalyticsProps {
  proposalId: string
  citizen: any | null
  citizenEligibility: CitizenshipQualification | null
  proposalType: string
}

export const CitizenVotingAnalytics = ({
  proposalId,
  citizen,
  citizenEligibility,
  proposalType,
}: CitizenVotingAnalyticsProps) => {
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
    getCitizenStatus,
    track,
  ])

  return null
}

// Hook to track button clicks
export const useCitizenVotingButtonTracking = (proposalId: string) => {
  const { track } = useAnalytics()

  const trackButtonClick = (buttonType: string) => {
    track("Citizen Voting Button Click", {
      proposal_id: proposalId,
      button_type: buttonType,
    })
  }

  return { trackButtonClick }
}

// Hook to track vote submission
export const useCitizenVoteSubmissionTracking = (proposalId: string) => {
  const { track } = useAnalytics()

  const trackVoteSubmitted = (choice: any, walletAddress: string) => {
    track("Citizen Vote Submitted", {
      proposal_id: proposalId,
      choice: JSON.stringify(choice),
      wallet_address: walletAddress,
    })
  }

  const trackVoteError = (error: string) => {
    track("Citizen Vote Error", {
      proposal_id: proposalId,
      error: error,
    })
  }

  return { trackVoteSubmitted, trackVoteError }
} 