"use client"
import { useLogin } from "@privy-io/react-auth"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { voteAction } from "@/components/proposals/proposal.types"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export interface CardActionsProps {
  cardActionList: voteAction[]
  proposalId?: string
}

const VoterActions = ({ cardActionList, proposalId }: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {cardActionList &&
        cardActionList.map((action, idx) => (
          <CardAction {...action} proposalId={proposalId} key={idx} />
        ))}
    </div>
  )
}

const CardAction = ({
  buttonStyle,
  actionText,
  actionType,
  action,
  disabled,
  loading,
  proposalId,
}: voteAction & { proposalId?: string }) => {
  const router = useRouter()
  const { login: privyLogin } = useLogin({
    onComplete: () => {
      // Refresh the page after sign-in to rebuild ProposalPageDataInterface
      router.refresh()
    },
  })
  const { track } = useAnalytics()

  const handleAction = async () => {
    // Track button click before performing action
    let buttonType = ""
    switch (actionType.toLowerCase()) {
      case "log":
        console.log("log")
        break
      case "vote":
        buttonType = "Submit vote"
        track("Citizen Voting Button Click", {
          proposal_id: proposalId,
          button_type: buttonType,
        })
        // To be overwritten by the component that uses this
        await action()
        break
      case "register":
        buttonType = "Register to Vote"
        track("Citizen Voting Button Click", {
          proposal_id: proposalId,
          button_type: buttonType,
        })
        const currentPath = window.location.pathname + window.location.search
        router.push(
          `/citizenship?redirectUrl=${encodeURIComponent(currentPath)}`,
        )
        break
      case "learn more":
        buttonType = "Go to vote.optimism.io"
        track("Citizen Voting Button Click", {
          proposal_id: proposalId,
          button_type: buttonType,
        })
        router.push(
          "https://community.optimism.io/citizens-house/citizen-house-overview",
        )
        break
      case "sign in":
        buttonType = "Sign In"
        track("Citizen Voting Button Click", {
          proposal_id: proposalId,
          button_type: buttonType,
        })
        privyLogin()
        break
      default:
        console.log(`Action type: ${actionType}`)
        break
    }
  }

  if (loading) {
    return (
      <div
        className={`rounded-md border border-solid p-3 w-full sm:w-[256px] h-10 flex items-center justify-center font-medium text-sm leading-5 font-inter ${buttonStyle}`}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  return (
    <button
      onClick={handleAction}
      disabled={disabled}
      className={`rounded-md border-solid p-3 w-full sm:w-[256px] h-10 flex items-center justify-center font-medium text-sm leading-5 font-inter ${buttonStyle} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {actionText}
    </button>
  )
}

export default VoterActions
