"use client"
import { voteAction } from "@/components/proposals/proposal.types"
import { useRouter } from "next/navigation"
import { useLogin } from "@privy-io/react-auth"
import { Loader2 } from "lucide-react"

export interface CardActionsProps {
  cardActionList: voteAction[]
}

const VotingActions = ({ cardActionList }: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center mt-4 mr-6 mb-6 ml-6">
      {cardActionList &&
        cardActionList.map((action, idx) => (
          <CardAction {...action} key={idx} />
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
}: voteAction) => {
  const router = useRouter()
  const { login: privyLogin } = useLogin({
    onComplete: () => {
      // Refresh the page after sign-in to rebuild ProposalPageDataInterface
      router.refresh()
    },
  })
  const handleAction = async () => {
    switch (actionType.toLowerCase()) {
      case "log":
        console.log("log")
        break
      case "vote":
        // To be overwritten by the component that uses this
        await action()
        break
      case "register":
        const currentPath = window.location.pathname + window.location.search
        router.push(`/citizenship?redirectUrl=${encodeURIComponent(currentPath)}`)
        break
      case "learn more":
        router.push(
          "https://community.optimism.io/citizens-house/citizen-house-overview",
        )
        break
      case "sign in":
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
