"use client"
import { voteAction } from "@/components/proposals/proposal.types"
import { useRouter } from "next/navigation"
import { useLogin } from "@privy-io/react-auth"
import { Loader2 } from "lucide-react"
import { useCitizenVotingButtonTracking } from "@/components/proposals/proposalPage/CitizenVotingAnalytics"

export interface CardActionsProps {
  cardActionList: voteAction[]
  proposalId?: string
}

const VotingActions = ({ cardActionList, proposalId }: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center mt-4 mr-6 mb-6 ml-6">
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
  const { trackButtonClick } = useCitizenVotingButtonTracking(proposalId || "")

  const handleAction = async () => {
    // Track button click before performing action
    let buttonType = ""
    switch (actionType.toLowerCase()) {
      case "log":
        console.log("log")
        break
      case "vote":
        buttonType = "Submit vote"
        trackButtonClick(buttonType)
        // To be overwritten by the component that uses this
        await action()
        break
      case "register":
        buttonType = "Register to Vote"
        trackButtonClick(buttonType)
        router.push("/citizenship")
        break
      case "learn more":
        buttonType = "Go to vote.optimism.io"
        trackButtonClick(buttonType)
        router.push(
          "https://community.optimism.io/citizens-house/citizen-house-overview",
        )
        break
      case "sign in":
        buttonType = "Sign In"
        trackButtonClick(buttonType)
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
        className={`rounded-md border border-solid p-3 mb-1 w-60 h-10 flex items-center justify-center font-medium text-sm leading-5 font-inter ${buttonStyle}`}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  return (
    <button
      onClick={handleAction}
      disabled={disabled}
      className={`rounded-md border border-solid p-3 mb-1 w-60 h-10 flex items-center justify-center font-medium text-sm leading-5 font-inter ${buttonStyle} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {actionText}
    </button>
  )
}

export default VotingActions
